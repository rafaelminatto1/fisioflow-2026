import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, patients, packages } from '@/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/financial/balance - Get balance sheet (simplified)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();

    const cacheKey = `reports:balance:${asOfDate}`;

    const balance = await withCache(
      cacheKey,
      async () => {
        const asOf = new Date(asOfDate);

        // Get total income and expenses up to date
        const totals = await db.execute(sql`
          SELECT
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
          FROM transactions
          WHERE date <= ${asOf}
        `);

        // Get active packages (liability)
        const activePackages = await db.execute(sql`
          SELECT
            COUNT(*) as count,
            SUM(total_sessions - used_sessions) as "remainingSessions",
            SUM(price * (total_sessions - used_sessions) / total_sessions) as "remainingValue"
          FROM packages
          WHERE status = 'active'
            AND (expiry_date IS NULL OR expiry_date > ${asOf})
        `);

        // Get outstanding receivables (simplified - would need actual tracking)
        const receivables = await db.execute(sql`
          SELECT
            COUNT(*) as count,
            COALESCE(SUM(amount), 0) as total
          FROM transactions
          WHERE type = 'income'
            AND date <= ${asOf}
        `);

        const totalIncome = Number(totals[0]?.total_income || 0);
        const totalExpense = Number(totals[0]?.total_expense || 0);
        const remainingValue = Number(activePackages[0]?.remainingValue || 0);

        return {
          asOfDate: asOf.toISOString(),
          assets: {
            cash: totalIncome - totalExpense,
            receivables: Number(receivables[0]?.total || 0),
          },
          liabilities: {
            activePackages: remainingValue,
          },
          equity: {
            total: totalIncome - totalExpense - remainingValue,
          },
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate balance sheet' },
      { status: 500 }
    );
  }
}
