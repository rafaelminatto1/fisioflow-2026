import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientSessions, patients } from '@/db/schema';
import { sql, and, gte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/patients/retention - Get patient retention report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '90'; // days

    const cacheKey = `reports:patients:retention:${period}`;

    const retention = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Get session frequency by patient
        const frequency = await db.execute(sql`
          SELECT
            ps.patient_id,
            p.full_name as "patientName",
            COUNT(*) as "sessionCount",
            MIN(ps.date) as "firstSession",
            MAX(ps.date) as "lastSession"
          FROM patient_sessions ps
          JOIN patients p ON ps.patient_id = p.id
          WHERE ps.created_at >= ${startDate}
          GROUP BY ps.patient_id, p.full_name
          ORDER BY "sessionCount" DESC
          LIMIT 20
        `);

        // Calculate retention by month
        const monthlyRetention = await db.execute(sql`
          WITH monthly_patients AS (
            SELECT
              TO_DATE(date, 'DD/MM/YYYY') as session_date,
              EXTRACT(YEAR FROM TO_DATE(date, 'DD/MM/YYYY')) as year,
              EXTRACT(MONTH FROM TO_DATE(date, 'DD/MM/YYYY')) as month,
              COUNT(DISTINCT patient_id) as "uniquePatients"
            FROM patient_sessions
            WHERE TO_DATE(date, 'DD/MM/YYYY') >= ${startDate}
            GROUP BY year, month
            ORDER BY year DESC, month DESC
          )
          SELECT * FROM monthly_patients
        `);

        // Churn risk (patients with no sessions in last 30 days)
        const churnRisk = await db.execute(sql`
          SELECT
            p.id,
            p.full_name as "patientName",
            p.phone,
            p.last_active_date as "lastActiveDate",
            EXTRACT(DAY FROM (NOW() - p.last_active_date)) as "daysSinceActive"
          FROM patients p
          WHERE p.is_active = true
            AND (p.last_active_date IS NULL OR p.last_active_date < NOW() - INTERVAL '30 days')
          ORDER BY "daysSinceActive" DESC
          LIMIT 20
        `);

        return {
          period: { days: parseInt(period), startDate, endDate: now },
          topActive: frequency,
          monthlyTrend: monthlyRetention,
          churnRisk: churnRisk,
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(retention);
  } catch (error) {
    console.error('Error generating patient retention report:', error);
    return NextResponse.json(
      { error: 'Failed to generate patient retention report' },
      { status: 500 }
    );
  }
}
