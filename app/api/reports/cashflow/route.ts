import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, accountsReceivable, accountsPayable } from '@/db/schema';
import { eq, gte, lte, and, sql, ne } from 'drizzle-orm';

interface CashFlowEntry {
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  balance: number;
}

// GET /api/reports/cashflow - Fluxo de Caixa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const view = searchParams.get('view') || 'daily'; // daily, weekly, monthly
    const includeProjected = searchParams.get('projected') === 'true';

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + (includeProjected ? 7 * 24 * 60 * 60 * 1000 : 0));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = includeProjected 
          ? new Date(now.getFullYear(), now.getMonth() + 1, 0) 
          : now;
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        endDate = includeProjected 
          ? new Date(now.getFullYear(), now.getMonth() + 1, 0) 
          : now;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = includeProjected 
          ? new Date(now.getFullYear(), 11, 31) 
          : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    // Get realized transactions
    const realizedTransactions = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        description: transactions.description,
        type: transactions.type,
        category: transactions.category,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDate),
          lte(transactions.date, now) // Only realized up to today
        )
      )
      .orderBy(transactions.date);

    // Get projected receivables
    let projectedReceivables: any[] = [];
    if (includeProjected) {
      projectedReceivables = await db
        .select({
          id: accountsReceivable.id,
          dueDate: accountsReceivable.dueDate,
          description: accountsReceivable.description,
          amount: accountsReceivable.amount,
          paidAmount: accountsReceivable.paidAmount,
        })
        .from(accountsReceivable)
        .where(
          and(
            eq(accountsReceivable.status, 'pending'),
            gte(accountsReceivable.dueDate, now),
            lte(accountsReceivable.dueDate, endDate)
          )
        );
    }

    // Get projected payables
    let projectedPayables: any[] = [];
    if (includeProjected) {
      projectedPayables = await db
        .select({
          id: accountsPayable.id,
          dueDate: accountsPayable.dueDate,
          description: accountsPayable.description,
          amount: accountsPayable.amount,
        })
        .from(accountsPayable)
        .where(
          and(
            eq(accountsPayable.status, 'pending'),
            gte(accountsPayable.dueDate, now),
            lte(accountsPayable.dueDate, endDate)
          )
        );
    }

    // Calculate opening balance (sum of all transactions before startDate)
    const openingBalanceResult = await db
      .select({
        income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(lte(transactions.date, startDate));

    const openingBalance = ((openingBalanceResult[0]?.income || 0) - (openingBalanceResult[0]?.expense || 0)) / 100;

    // Build cashflow entries
    const entries: CashFlowEntry[] = [];
    let runningBalance = openingBalance;

    // Add realized transactions
    for (const t of realizedTransactions) {
      const amount = (t.amount || 0) / 100;
      const change = t.type === 'income' ? amount : -amount;
      runningBalance += change;

      entries.push({
        date: t.date?.toISOString().split('T')[0] || '',
        description: t.description || '',
        type: t.type as 'income' | 'expense',
        category: t.category || 'other',
        amount: amount,
        balance: runningBalance,
      });
    }

    // Add projected receivables
    for (const r of projectedReceivables) {
      const amount = ((r.amount || 0) - (r.paidAmount || 0)) / 100;
      runningBalance += amount;

      entries.push({
        date: r.dueDate?.toISOString().split('T')[0] || '',
        description: `[Projetado] ${r.description}`,
        type: 'income',
        category: 'projected_receivable',
        amount: amount,
        balance: runningBalance,
      });
    }

    // Add projected payables
    for (const p of projectedPayables) {
      const amount = (p.amount || 0) / 100;
      runningBalance -= amount;

      entries.push({
        date: p.dueDate?.toISOString().split('T')[0] || '',
        description: `[Projetado] ${p.description}`,
        type: 'expense',
        category: 'projected_payable',
        amount: amount,
        balance: runningBalance,
      });
    }

    // Sort entries by date
    entries.sort((a, b) => a.date.localeCompare(b.date));

    // Recalculate running balance after sorting
    let balance = openingBalance;
    for (const entry of entries) {
      balance += entry.type === 'income' ? entry.amount : -entry.amount;
      entry.balance = balance;
    }

    // Group by view type if needed
    let groupedData: any = {};
    if (view === 'daily') {
      groupedData = groupByDay(entries);
    } else if (view === 'weekly') {
      groupedData = groupByWeek(entries);
    } else if (view === 'monthly') {
      groupedData = groupByMonth(entries);
    }

    // Calculate totals
    const totalIncome = entries
      .filter(e => e.type === 'income' && !e.category.startsWith('projected_'))
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = entries
      .filter(e => e.type === 'expense' && !e.category.startsWith('projected_'))
      .reduce((sum, e) => sum + e.amount, 0);
    const projectedIncome = entries
      .filter(e => e.category === 'projected_receivable')
      .reduce((sum, e) => sum + e.amount, 0);
    const projectedExpense = entries
      .filter(e => e.category === 'projected_payable')
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        view,
        includeProjected,
      },
      openingBalance,
      closingBalance: runningBalance,
      summary: {
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense,
        projectedIncome,
        projectedExpense,
        projectedNetCashFlow: projectedIncome - projectedExpense,
      },
      entries,
      grouped: groupedData,
    });
  } catch (error) {
    console.error('Error generating cashflow report:', error);
    return NextResponse.json(
      { error: 'Failed to generate cashflow report' },
      { status: 500 }
    );
  }
}

function groupByDay(entries: CashFlowEntry[]) {
  const grouped: Record<string, { income: number; expense: number; balance: number }> = {};
  
  for (const entry of entries) {
    if (!grouped[entry.date]) {
      grouped[entry.date] = { income: 0, expense: 0, balance: entry.balance };
    }
    if (entry.type === 'income') {
      grouped[entry.date].income += entry.amount;
    } else {
      grouped[entry.date].expense += entry.amount;
    }
    grouped[entry.date].balance = entry.balance;
  }

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    ...data,
    net: data.income - data.expense,
  }));
}

function groupByWeek(entries: CashFlowEntry[]) {
  const grouped: Record<string, { income: number; expense: number; balance: number }> = {};
  
  for (const entry of entries) {
    const date = new Date(entry.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!grouped[weekKey]) {
      grouped[weekKey] = { income: 0, expense: 0, balance: entry.balance };
    }
    if (entry.type === 'income') {
      grouped[weekKey].income += entry.amount;
    } else {
      grouped[weekKey].expense += entry.amount;
    }
    grouped[weekKey].balance = entry.balance;
  }

  return Object.entries(grouped).map(([week, data]) => ({
    week,
    ...data,
    net: data.income - data.expense,
  }));
}

function groupByMonth(entries: CashFlowEntry[]) {
  const grouped: Record<string, { income: number; expense: number; balance: number }> = {};
  
  for (const entry of entries) {
    const monthKey = entry.date.substring(0, 7); // YYYY-MM

    if (!grouped[monthKey]) {
      grouped[monthKey] = { income: 0, expense: 0, balance: entry.balance };
    }
    if (entry.type === 'income') {
      grouped[monthKey].income += entry.amount;
    } else {
      grouped[monthKey].expense += entry.amount;
    }
    grouped[monthKey].balance = entry.balance;
  }

  return Object.entries(grouped).map(([month, data]) => ({
    month,
    ...data,
    net: data.income - data.expense,
  }));
}
