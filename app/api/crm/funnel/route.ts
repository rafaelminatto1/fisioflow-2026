import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { sql, and, gte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/crm/funnel - Get CRM conversion funnel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const cacheKey = `crm-funnel:${period}`;

    const funnel = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Get funnel data
        const result = await db.execute(sql`
          WITH funnel_data AS (
            SELECT
              status,
              COUNT(*) as count
            FROM leads
            WHERE created_at >= ${startDate}
            GROUP BY status
          ),
          totals AS (
            SELECT COUNT(*) as total FROM leads WHERE created_at >= ${startDate}
          )
          SELECT
            fd.status,
            fd.count,
            t.total,
            ROUND((fd.count::numeric / NULLIF(t.total::numeric, 0)) * 100, 1) as percentage
          FROM funnel_data fd
          CROSS JOIN totals t
          ORDER BY
            CASE fd.status
              WHEN 'new' THEN 1
              WHEN 'contacted' THEN 2
              WHEN 'qualified' THEN 3
              WHEN 'converted' THEN 4
              WHEN 'lost' THEN 5
              ELSE 6
            END
        `);

        // Calculate stage-by-stage drop-off
        const stages = result.rows;
        let previousCount = Number(stages[0]?.count || 0);

        const funnelWithDropOff = stages.map((stage: any) => {
          const count = Number(stage.count || 0);
          const dropOff = previousCount - count;
          const dropOffPercent = previousCount > 0
            ? ((dropOff / previousCount) * 100).toFixed(1)
            : 0;
          previousCount = count;

          return {
            ...stage,
            dropOff: dropOff > 0 ? dropOff : 0,
            dropOffPercent: parseFloat(dropOffPercent as string),
          };
        });

        return {
          period: parseInt(period),
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          funnel: funnelWithDropOff,
        };
      },
      { ttl: 300 }
    );

    return NextResponse.json(funnel);
  } catch (error) {
    console.error('Error fetching CRM funnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM funnel' },
      { status: 500 }
    );
  }
}
