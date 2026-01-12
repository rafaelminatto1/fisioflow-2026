import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, transactions } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/patients/lifetime - Get patient lifetime value report
export async function GET(request: NextRequest) {
  try {
    const cacheKey = `reports:patients:lifetime`;

    const ltv = await withCache(
      cacheKey,
      async () => {
        // Get LTV by patient
        const patientLTV = await db.execute(sql`
          SELECT
            p.id,
            p.full_name as "patientName",
            p.created_at as "patientSince",
            COUNT(DISTINCT t.id) as "transactionCount",
            COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as "totalRevenue",
            COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as "totalCost",
            EXTRACT(DAY FROM (NOW() - p.created_at)) as "daysSinceCreated"
          FROM patients p
          LEFT JOIN transactions t ON p.id = t.patient_id
          WHERE p.is_active = true
          GROUP BY p.id, p.full_name, p.created_at
          HAVING COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) > 0
          ORDER BY "totalRevenue" DESC
          LIMIT 50
        `);

        // Calculate LTV metrics
        const totalRevenue = patientLTV.reduce((sum: number, p: any) => sum + Number(p.totalRevenue), 0);
        const avgRevenue = totalRevenue / patientLTV.length;

        return {
          topPatients: patientLTV.map((p: any) => ({
            ...p,
            totalRevenueFormatted: (Number(p.totalRevenue) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            avgMonthlyRevenue: p.daysSinceCreated > 0
              ? ((Number(p.totalRevenue) / p.daysSinceCreated) * 30).toFixed(2)
              : 0,
          })),
          summary: {
            totalPatients: patientLTV.length,
            totalRevenue: totalRevenue / 100,
            avgRevenuePerPatient: avgRevenue / 100,
          },
        };
      },
      { ttl: 600 }
    );

    return NextResponse.json(ltv);
  } catch (error) {
    console.error('Error generating patient LTV report:', error);
    return NextResponse.json(
      { error: 'Failed to generate patient LTV report' },
      { status: 500 }
    );
  }
}
