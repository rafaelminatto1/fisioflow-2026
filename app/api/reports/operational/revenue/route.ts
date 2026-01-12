import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, appointments } from '@/db/schema';
import { sql, and, gte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/operational/revenue - Get operational revenue report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const cacheKey = `reports:operational:revenue:${period}`;

    const report = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Revenue by category
        const byCategory = await db.execute(sql`
          SELECT
            category,
            COUNT(*) as "transactionCount",
            SUM(amount) as total
          FROM transactions
          WHERE type = 'income'
            AND date >= ${startDate}
          GROUP BY category
          ORDER BY total DESC
        `);

        // Revenue by payment method
        const byPaymentMethod = await db.execute(sql`
          SELECT
            payment_method,
            COUNT(*) as count,
            SUM(amount) as total
          FROM transactions
          WHERE type = 'income'
            AND date >= ${startDate}
          GROUP BY payment_method
          ORDER BY total DESC
        `);

        // Daily revenue
        const dailyRevenue = await db.execute(sql`
          SELECT
            DATE(date) as date,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
          FROM transactions
          WHERE date >= ${startDate}
          GROUP BY DATE(date)
          ORDER BY date DESC
        `);

        return {
          period: { days: parseInt(period), startDate, endDate: now },
          byCategory: byCategory.map((r: any) => ({
            ...r,
            totalFormatted: (Number(r.total) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          })),
          byPaymentMethod: byPaymentMethod.map((r: any) => ({
            ...r,
            totalFormatted: (Number(r.total) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          })),
          dailyRevenue: dailyRevenue.map((r: any) => ({
            ...r,
            incomeFormatted: (Number(r.income) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            netFormatted: (Number(r.net) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          })),
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating operational revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to generate operational revenue report' },
      { status: 500 }
    );
  }
}
