import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/financial/dre - Get DRE (Demonstrativo de Resultados)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const cacheKey = `reports:dre:${startDate}:${endDate}`;

    const dre = await withCache(
      cacheKey,
      async () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Get revenue by category
        const revenue = await db.execute(sql`
          SELECT
            category,
            SUM(amount) as total
          FROM transactions
          WHERE type = 'income'
            AND date >= ${start}
            AND date <= ${end}
          GROUP BY category
          ORDER BY total DESC
        `);

        // Get expenses by category
        const expenses = await db.execute(sql`
          SELECT
            category,
            SUM(amount) as total
          FROM transactions
          WHERE type = 'expense'
            AND date >= ${start}
            AND date <= ${end}
          GROUP BY category
          ORDER BY total DESC
        `);

        // Calculate totals
        const totalRevenue = revenue.reduce((sum: number, r: any) => sum + Number(r.total), 0);
        const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.total), 0);
        const profit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return {
          period: { startDate, endDate },
          revenue: {
            byCategory: revenue.map((r: any) => ({
              category: r.category,
              total: Number(r.total),
              totalFormatted: (Number(r.total) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }),
            })),
            total: totalRevenue,
            totalFormatted: (totalRevenue / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          },
          expenses: {
            byCategory: expenses.map((e: any) => ({
              category: e.category,
              total: Number(e.total),
              totalFormatted: (Number(e.total) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }),
            })),
            total: totalExpenses,
            totalFormatted: (totalExpenses / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          },
          profit: {
            value: profit,
            valueFormatted: (profit / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            margin: profitMargin,
          },
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(dre);
  } catch (error) {
    console.error('Error generating DRE report:', error);
    return NextResponse.json(
      { error: 'Failed to generate DRE report' },
      { status: 500 }
    );
  }
}
