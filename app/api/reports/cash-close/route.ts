import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, payments, accountsReceivable, accountsPayable, appointments } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { format, startOfDay, endOfDay } from 'date-fns';

// GET /api/reports/cash-close - Daily cash close report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let targetDate: Date;
    let rangeStart: Date;
    let rangeEnd: Date;

    if (dateParam) {
      targetDate = new Date(dateParam);
      rangeStart = startOfDay(targetDate);
      rangeEnd = endOfDay(targetDate);
    } else if (startDate && endDate) {
      rangeStart = startOfDay(new Date(startDate));
      rangeEnd = endOfDay(new Date(endDate));
    } else {
      targetDate = new Date();
      rangeStart = startOfDay(targetDate);
      rangeEnd = endOfDay(targetDate);
    }

    // Get all transactions in the period
    const allTransactions = await db.select()
      .from(transactions)
      .where(
        and(
          gte(transactions.date, rangeStart),
          lte(transactions.date, rangeEnd)
        )
      )
      .orderBy(desc(transactions.date));

    // Get payments in the period
    const allPayments = await db.select()
      .from(payments)
      .where(
        and(
          gte(payments.createdAt, rangeStart),
          lte(payments.createdAt, rangeEnd)
        )
      )
      .orderBy(desc(payments.createdAt));

    // Get sessions (appointments) in the period
    const sessions = await db.select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, rangeStart),
          lte(appointments.startTime, rangeEnd)
        )
      );

    // Calculate totals by payment method
    const cashByMethod: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;
    let totalPending = 0;

    // Process transactions
    for (const txn of allTransactions) {
      const method = txn.paymentMethod || 'other';
      if (!cashByMethod[method]) {
        cashByMethod[method] = 0;
      }

      if (txn.type === 'income') {
        cashByMethod[method] += Number(txn.amount);
        totalIncome += Number(txn.amount);
      } else if (txn.type === 'expense') {
        totalExpense += Number(txn.amount);
      }
    }

    // Process payments
    for (const payment of allPayments) {
      const method = payment.paymentMethod || 'stripe';
      if (!cashByMethod[method]) {
        cashByMethod[method] = 0;
      }

      if (payment.status === 'completed') {
        cashByMethod[method] += Number(payment.amount);
        totalIncome += Number(payment.amount);
      } else if (payment.status === 'pending') {
        totalPending += Number(payment.amount);
      }
    }

    // Get overdue accounts receivable
    const overdueReceivables = await db.select()
      .from(accountsReceivable)
      .where(
        and(
          sql`${accountsReceivable.dueDate} < NOW()`,
          sql`${accountsReceivable.status} != 'paid'`
        )
      );

    const totalOverdue = overdueReceivables.reduce((sum, acc) => {
      return sum + (Number(acc.amount) - Number(acc.paidAmount));
    }, 0);

    // Get upcoming accounts payable
    const upcomingPayables = await db.select()
      .from(accountsPayable)
      .where(
        and(
          gte(accountsPayable.dueDate, rangeStart),
          sql`${accountsPayable.status} != 'paid'`
        )
      )
      .orderBy(sql`${accountsPayable.dueDate} ASC`)
      .limit(20);

    const totalUpcomingPayables = upcomingPayables.reduce((sum, acc) => {
      return sum + (Number(acc.amount) - Number(acc.paidAmount));
    }, 0);

    // Calculate summary
    const netCash = totalIncome - totalExpense;
    const pendingReceivables = await db.select()
      .from(accountsReceivable)
      .where(eq(accountsReceivable.status, 'pending'));

    const totalPendingReceivables = pendingReceivables.reduce((sum, acc) => {
      return sum + (Number(acc.amount) - Number(acc.paidAmount));
    }, 0);

    // Build report
    const report = {
      period: {
        start: rangeStart,
        end: rangeEnd,
        date: dateParam || format(rangeStart, 'yyyy-MM-dd'),
      },
      summary: {
        totalIncome,
        totalExpense,
        netCash,
        totalPending,
        totalOverdue,
        totalPendingReceivables,
        totalUpcomingPayables,
      },
      breakdownByMethod: Object.entries(cashByMethod).map(([method, amount]) => ({
        method,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      })),
      sessions: {
        total: sessions.length,
        completed: sessions.filter(s => s.status === 'completed').length,
        cancelled: sessions.filter(s => s.status === 'cancelled').length,
        noShow: sessions.filter(s => s.status === 'no_show').length,
      },
      transactions: {
        count: allTransactions.length,
        items: allTransactions,
      },
      payments: {
        count: allPayments.length,
        completed: allPayments.filter(p => p.status === 'completed').length,
        pending: allPayments.filter(p => p.status === 'pending').length,
        failed: allPayments.filter(p => p.status === 'failed').length,
        items: allPayments,
      },
      overdue: {
        count: overdueReceivables.length,
        items: overdueReceivables,
      },
      upcomingPayables: {
        count: upcomingPayables.length,
        total: totalUpcomingPayables,
        items: upcomingPayables,
      },
      generatedAt: new Date(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating cash close report:', error);
    return NextResponse.json(
      { error: 'Failed to generate cash close report' },
      { status: 500 }
    );
  }
}

// POST /api/reports/cash-close - Close the cash register (create closing record)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, closedBy, notes } = body;

    const targetDate = date ? new Date(date) : new Date();
    const rangeStart = startOfDay(targetDate);
    const rangeEnd = endOfDay(targetDate);

    // First get the report data
    const reportResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reports/cash-close?date=${format(targetDate, 'yyyy-MM-dd')}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const report = await reportResponse.json();

    // Create closing record transaction
    await db.insert(transactions).values({
      type: 'expense',
      category: 'cash_close',
      amount: Math.round(report.summary.netCash * 100), // Convert to cents
      description: `Fechamento de caixa - ${format(targetDate, 'dd/MM/yyyy')}${closedBy ? ` | ${closedBy}` : ''}${notes ? ` | ${notes}` : ''}`,
      paymentMethod: 'internal',
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      closingDate: targetDate,
      report,
    });
  } catch (error) {
    console.error('Error closing cash register:', error);
    return NextResponse.json(
      { error: 'Failed to close cash register' },
      { status: 500 }
    );
  }
}
