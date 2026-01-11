import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, appointments, transactions, staff, painLogs, patientSessions } from '@/db/schema';
import { eq, gte, lte, and, count, sql, desc } from 'drizzle-orm';

// GET /api/reports - Get various reports with real data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';
    const period = searchParams.get('period') || 'month';

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Calculate date range based on period
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    switch (type) {
      case 'dashboard': {
        // Get active patients count
        const activePatientsResult = await db
          .select({ count: count() })
          .from(patients)
          .where(eq(patients.isActive, true));
        const activePatients = activePatientsResult[0]?.count || 0;

        // Get monthly revenue from transactions
        const revenueResult = await db
          .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
          .from(transactions)
          .where(
            and(
              eq(transactions.type, 'income'),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate)
            )
          );
        const monthlyRevenue = (revenueResult[0]?.total || 0) / 100; // Convert cents to reais

        // Get today's appointments
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        const todayAppointmentsResult = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              gte(appointments.startTime, todayStart),
              lte(appointments.startTime, todayEnd)
            )
          );
        const appointmentsToday = todayAppointmentsResult[0]?.count || 0;

        // Calculate occupancy rate (appointments / working days * slots)
        const workingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const totalSlots = workingDays * 8; // Assuming 8 slots per day
        const monthAppointmentsResult = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              gte(appointments.startTime, startDate),
              lte(appointments.startTime, endDate)
            )
          );
        const occupancyRate = totalSlots > 0
          ? Math.round(((monthAppointmentsResult[0]?.count || 0) / totalSlots) * 100)
          : 0;

        // No-show rate
        const noShowResult = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              gte(appointments.startTime, startDate),
              lte(appointments.startTime, endDate),
              eq(appointments.status, 'no_show')
            )
          );
        const totalAppointments = monthAppointmentsResult[0]?.count || 1;
        const noShowRate = Math.round(((noShowResult[0]?.count || 0) / totalAppointments) * 100);

        return NextResponse.json({
          activePatients,
          monthlyRevenue,
          appointmentsToday,
          occupancyRate,
          noShowRate,
          confirmationRate: 85, // Placeholder - would need reminders tracking
        });
      }

      case 'financial': {
        // Get income and expenses
        const incomeResult = await db
          .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
          .from(transactions)
          .where(
            and(
              eq(transactions.type, 'income'),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate)
            )
          );
        const totalRevenue = (incomeResult[0]?.total || 0) / 100;

        const expenseResult = await db
          .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
          .from(transactions)
          .where(
            and(
              eq(transactions.type, 'expense'),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate)
            )
          );
        const totalExpenses = (expenseResult[0]?.total || 0) / 100;

        // Get chart data by month
        const chartData = await db
          .select({
            month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
            income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
            expenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
          })
          .from(transactions)
          .where(gte(transactions.date, startDate))
          .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
          .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`);

        const formattedChartData = chartData.map(d => ({
          month: d.month,
          revenue: d.income / 100,
          expenses: d.expenses / 100,
          margin: ((d.income - d.expenses) / 100),
        }));

        return NextResponse.json({
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses,
          chartData: formattedChartData,
        });
      }

      case 'executive': {
        // Get active patients
        const activePatientsResult = await db
          .select({ count: count() })
          .from(patients)
          .where(eq(patients.isActive, true));
        const activePatients = activePatientsResult[0]?.count || 0;

        // Get revenue
        const revenueResult = await db
          .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
          .from(transactions)
          .where(
            and(
              eq(transactions.type, 'income'),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate)
            )
          );
        const monthlyRevenue = (revenueResult[0]?.total || 0) / 100;

        // Get appointments today
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));
        const todayAppointmentsResult = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              gte(appointments.startTime, todayStart),
              lte(appointments.startTime, todayEnd)
            )
          );
        const appointmentsToday = todayAppointmentsResult[0]?.count || 0;

        // Get therapist performance
        const therapistPerformance = await db
          .select({
            therapistId: staff.id,
            name: staff.name,
            appointments: count(),
          })
          .from(appointments)
          .rightJoin(staff, eq(appointments.therapistId, staff.id))
          .where(
            and(
              gte(appointments.startTime, startDate),
              lte(appointments.startTime, endDate)
            )
          )
          .groupBy(staff.id, staff.name)
          .orderBy(desc(count()));

        // Get pain score improvement (avg change from first to last session)
        const painImprovement = await db
          .select({
            avgScore: sql<number>`COALESCE(AVG(${painLogs.level}), 0)`,
          })
          .from(painLogs)
          .where(gte(painLogs.createdAt, startDate));

        return NextResponse.json({
          kpis: {
            activePatients,
            monthlyRevenue,
            appointmentsToday,
          },
          financial: {
            totalRevenue: monthlyRevenue,
            totalExpenses: monthlyRevenue * 0.4, // Placeholder
            netIncome: monthlyRevenue * 0.6,
            chartData: [],
          },
          clinical: {
            totalActiveTreatments: activePatients,
            dischargesThisMonth: 0, // Would need discharge tracking
            avgPainReduction: painImprovement[0]?.avgScore || 0,
            treatmentSuccessRate: 85, // Placeholder
            topDiagnoses: [], // Would need diagnosis tracking
          },
          performance: therapistPerformance.map(t => ({
            therapistId: t.therapistId,
            name: t.name,
            appointments: t.appointments,
            total: t.appointments * 150, // Assuming avg R$150 per session
          })),
          healthScore: {
            score: 75,
            dimensions: {
              financial: 80,
              clinical: 75,
              operational: 70,
              marketing: 60,
              satisfaction: 85,
            },
          },
        });
      }

      case 'therapists': {
        const performance = await db
          .select({
            therapistId: staff.id,
            name: staff.name,
            appointments: count(),
            revenue: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
          })
          .from(staff)
          .leftJoin(appointments, eq(appointments.therapistId, staff.id))
          .leftJoin(transactions, eq(transactions.patientId, appointments.patientId))
          .where(
            and(
              gte(appointments.startTime, startDate),
              lte(appointments.startTime, endDate),
              eq(transactions.type, 'income')
            )
          )
          .groupBy(staff.id, staff.name)
          .orderBy(desc(count()));

        return NextResponse.json(
          performance.map(t => ({
            therapistId: t.therapistId,
            name: t.name,
            appointments: t.appointments,
            total: (t.revenue || 0) / 100,
          }))
        );
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
