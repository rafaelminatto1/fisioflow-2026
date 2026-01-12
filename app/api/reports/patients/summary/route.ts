import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, appointments, patientSessions } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/patients/summary - Get patient summary report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const cacheKey = `reports:patients:summary:${period}`;

    const summary = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Patient counts
        const counts = await db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE is_active = true) as "activePatients",
            COUNT(*) FILTER (WHERE is_active = false) as "inactivePatients",
            COUNT(*) as "totalPatients",
            AVG(total_points) as "avgPoints",
            AVG(level) as "avgLevel",
            AVG(current_streak) as "avgStreak"
          FROM patients
        `);

        // New patients in period
        const newPatients = await db.execute(sql`
          SELECT
            COUNT(*) as count,
            DATE(created_at) as date
          FROM patients
          WHERE created_at >= ${startDate}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `);

        // Patient retention (patients who had sessions in period)
        const retention = await db.execute(sql`
          SELECT
            COUNT(DISTINCT ps.patient_id) as "activePatients",
            COUNT(DISTINCT p.id) as "totalPatients"
          FROM patients p
          LEFT JOIN patient_sessions ps ON p.id = ps.patient_id
            AND ps.date >= ${startDate}
          WHERE p.is_active = true
        `);

        return {
          period: { days: parseInt(period), startDate, endDate: now },
          counts: counts[0] || {},
          newPatients: newPatients,
          retention: {
            activeInPeriod: Number(retention[0]?.activePatients || 0),
            totalActive: Number(retention[0]?.totalPatients || 0),
            rate: retention[0]?.totalPatients
              ? (Number(retention[0].activePatients) / Number(retention[0].totalPatients) * 100).toFixed(1)
              : 0,
          },
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating patient summary report:', error);
    return NextResponse.json(
      { error: 'Failed to generate patient summary report' },
      { status: 500 }
    );
  }
}
