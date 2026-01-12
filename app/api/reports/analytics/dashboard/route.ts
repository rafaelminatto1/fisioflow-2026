import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, leads, transactions, appointments } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/reports/analytics/dashboard - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const cacheKey = `reports:analytics:dashboard`;

    const dashboard = await withCache(
      cacheKey,
      async () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // KPIs
        const kpis = await db.execute(sql`
          WITH patient_stats AS (
            SELECT
              COUNT(*) FILTER (WHERE is_active = true) as "activePatients",
              COUNT(*) FILTER (WHERE created_at >= ${thisMonth}) as "newPatientsThisMonth"
            FROM patients
          ),
          lead_stats AS (
            SELECT
              COUNT(*) as "totalLeads",
              COUNT(*) FILTER (WHERE status = 'new') as "newLeads",
              COUNT(*) FILTER (WHERE created_at >= ${thisMonth}) as "leadsThisMonth"
            FROM leads
          ),
          revenue_stats AS (
            SELECT
              COALESCE(SUM(CASE WHEN type = 'income' AND date >= ${thisMonth} THEN amount ELSE 0 END), 0) as "revenueThisMonth",
              COALESCE(SUM(CASE WHEN type = 'income' AND date >= ${lastMonth} AND date < ${thisMonth} THEN amount ELSE 0 END), 0) as "revenueLastMonth"
            FROM transactions
          ),
          appointment_stats AS (
            SELECT
              COUNT(*) as "totalToday",
              COUNT(*) FILTER (WHERE status = 'completed') as "completedToday",
              COUNT(*) FILTER (WHERE start_time >= ${today} AND start_time < ${today} + INTERVAL '1 day') as "scheduledToday"
            FROM appointments
          )
          SELECT * FROM patient_stats, lead_stats, revenue_stats, appointment_stats
        `);

        // Recent activity
        const recentPatients = await db.execute(sql`
          SELECT id, full_name as "fullName", created_at as "createdAt"
          FROM patients
          ORDER BY created_at DESC
          LIMIT 5
        `);

        const recentLeads = await db.execute(sql`
          SELECT id, name, status, created_at as "createdAt"
          FROM leads
          ORDER BY created_at DESC
          LIMIT 5
        `);

        const recentTransactions = await db.execute(sql`
          SELECT id, type, category, amount, date
          FROM transactions
          ORDER BY date DESC
          LIMIT 10
        `);

        // Revenue trend (last 6 months)
        const revenueTrend = await db.execute(sql`
          SELECT
            TO_CHAR(date, 'YYYY-MM') as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
          FROM transactions
          WHERE date >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR(date, 'YYYY-MM')
          ORDER BY month DESC
        `);

        const kpi = kpis.rows[0] || {};

        return {
          kpis: {
            activePatients: Number(kpi.activePatients || 0),
            newPatientsThisMonth: Number(kpi.newPatientsThisMonth || 0),
            totalLeads: Number(kpi.totalLeads || 0),
            newLeads: Number(kpi.newLeads || 0),
            leadsThisMonth: Number(kpi.leadsThisMonth || 0),
            revenueThisMonth: Number(kpi.revenueThisMonth || 0),
            revenueLastMonth: Number(kpi.revenueLastMonth || 0),
            revenueGrowth: kpi.revenueLastMonth
              ? (((Number(kpi.revenueThisMonth) - Number(kpi.revenueLastMonth)) / Number(kpi.revenueLastMonth)) * 100).toFixed(1)
              : 0,
            appointmentsToday: Number(kpi.totalToday || 0),
            appointmentsCompletedToday: Number(kpi.completedToday || 0),
          },
          recent: {
            patients: recentPatients,
            leads: recentLeads,
            transactions: recentTransactions.rows.map((t: any) => ({
              ...t,
              amountFormatted: (Number(t.amount) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }),
            })),
          },
          revenueTrend: revenueTrend.rows.map((r: any) => ({
            ...r,
            incomeFormatted: (Number(r.income) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
            expenseFormatted: (Number(r.expense) / 100).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }),
          })),
          generatedAt: now.toISOString(),
        };
      },
      { ttl: 60 } // 1 minute cache for dashboard
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error generating dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate dashboard analytics' },
      { status: 500 }
    );
  }
}
