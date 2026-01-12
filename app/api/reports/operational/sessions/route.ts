import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patientSessions } from '@/db/schema';
import { sql, and, gte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/operational/sessions - Get operational sessions report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const cacheKey = `reports:operational:sessions:${period}`;

    const report = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Sessions by status
        const byStatus = await db.execute(sql`
          SELECT
            status,
            COUNT(*) as count
          FROM appointments
          WHERE start_time >= ${startDate}
          GROUP BY status
        `);

        // Sessions by type
        const byType = await db.execute(sql`
          SELECT
            type,
            COUNT(*) as count
          FROM appointments
          WHERE start_time >= ${startDate}
          GROUP BY type
        `);

        // Daily session count
        const dailyCount = await db.execute(sql`
          SELECT
            DATE(start_time) as date,
            COUNT(*) as count,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
            COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled
          FROM appointments
          WHERE start_time >= ${startDate}
          GROUP BY DATE(start_time)
          ORDER BY date DESC
        `);

        // No-show rate
        const noShow = await db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE status = 'cancelled') as "cancelledCount",
            COUNT(*) as "totalCount"
          FROM appointments
          WHERE start_time >= ${startDate}
        `);

        const cancelledCount = Number(noShow[0]?.cancelledCount || 0);
        const totalCount = Number(noShow[0]?.totalCount || 0);
        const noShowRate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;

        return {
          period: { days: parseInt(period), startDate, endDate: now },
          byStatus: byStatus,
          byType: byType,
          dailyCount: dailyCount,
          noShowRate: {
            percentage: noShowRate.toFixed(1),
            cancelled: cancelledCount,
            total: totalCount,
          },
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating operational sessions report:', error);
    return NextResponse.json(
      { error: 'Failed to generate operational sessions report' },
      { status: 500 }
    );
  }
}
