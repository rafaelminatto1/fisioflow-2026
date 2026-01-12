import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/financial/cash-flow - Get cash flow report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // 'day', 'week', 'month'

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const cacheKey = `reports:cash-flow:${startDate}:${endDate}:${groupBy}`;

    const cashFlow = await withCache(
      cacheKey,
      async () => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        let dateFormat = 'YYYY-MM-DD';
        if (groupBy === 'week') {
          dateFormat = 'IYYY-"W"IW'; // ISO week
        } else if (groupBy === 'month') {
          dateFormat = 'YYYY-MM';
        }

        // Get cash flow by period
        const result = await db.execute(sql`
          SELECT
            TO_CHAR(date, '${dateFormat}') as period,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
          FROM transactions
          WHERE date >= ${start}
            AND date <= ${end}
          GROUP BY period
          ORDER BY period
        `);

        // Calculate running balance
        let runningBalance = 0;
        const withBalance = result.rows.map((row: any) => {
          runningBalance += Number(row.net);
          return {
            period: row.period,
            income: Number(row.income),
            expense: Number(row.expense),
            net: Number(row.net),
            balance: runningBalance,
            incomeFormatted: (Number(row.income) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            expenseFormatted: (Number(row.expense) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            netFormatted: (Number(row.net) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            balanceFormatted: (runningBalance / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          };
        });

        return {
          period: { startDate, endDate, groupBy },
          cashFlow: withBalance,
          summary: {
            totalIncome: withBalance.reduce((sum, r) => sum + r.income, 0),
            totalExpense: withBalance.reduce((sum, r) => sum + r.expense, 0),
            finalBalance: runningBalance,
          },
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(cashFlow);
  } catch (error) {
    console.error('Error generating cash flow report:', error);
    return NextResponse.json(
      { error: 'Failed to generate cash flow report' },
      { status: 500 }
    );
  }
}
