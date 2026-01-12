import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, patients, transactions, appointments } from '@/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/crm/analytics - Get CRM analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const cacheKey = `crm-analytics:${period}`;

    const analytics = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Lead statistics
        const leadStatsResult = await db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE status = 'new') as "newLeads",
            COUNT(*) FILTER (WHERE status = 'contacted') as "contactedLeads",
            COUNT(*) FILTER (WHERE status = 'qualified') as "qualifiedLeads",
            COUNT(*) FILTER (WHERE status = 'converted') as "convertedLeads",
            COUNT(*) FILTER (WHERE status = 'lost') as "lostLeads",
            COUNT(*) as "totalLeads"
          FROM leads
          WHERE created_at >= ${startDate}
        `);

        // Conversion rates
        const conversionRatesResult = await db.execute(sql`
          SELECT
            COUNT(*) FILTER (WHERE status = 'converted')::float / NULLIF(COUNT(*)::float, 0) * 100 as "conversionRate"
          FROM leads
          WHERE created_at >= ${startDate}
        `);

        // Revenue per lead source
        const revenueBySourceResult = await db.execute(sql`
          SELECT
            l.source,
            COUNT(*) as "leadCount",
            COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'converted') as "convertedCount",
            COALESCE(SUM(t.amount), 0) as "totalRevenue"
          FROM leads l
          LEFT JOIN patients p ON l.phone = p.phone OR l.email = p.email
          LEFT JOIN transactions t ON p.id = t.patient_id
            AND t.type = 'income'
            AND t.date >= ${startDate}
          WHERE l.created_at >= ${startDate}
          GROUP BY l.source
          ORDER BY "totalRevenue" DESC
        `);

        // Average response time (mock - would need actual tracking)
        const avgResponseTimeResult = await db.execute(sql`
          SELECT
            EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600 as "avgHours"
          FROM leads
          WHERE created_at >= ${startDate}
            AND status != 'new'
          LIMIT 100
        `);

        return {
          period: parseInt(period),
          leads: leadStatsResult[0] || {},
          conversion: {
            rate: conversionRatesResult[0]?.conversionRate || 0,
          },
          revenueBySource: revenueBySourceResult,
          avgResponseTime: avgResponseTimeResult[0]?.avgHours || null,
          generatedAt: now.toISOString(),
        };
      },
      { ttl: 300 } // 5 minutes cache
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching CRM analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM analytics' },
      { status: 500 }
    );
  }
}
