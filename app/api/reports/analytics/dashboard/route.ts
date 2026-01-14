import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients } from '@/db/schema';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';

// GET /api/reports/analytics/dashboard - Get real-time analytics data
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Active sessions (appointments in progress)
    const [activeSessionsResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          lte(appointments.startTime, now),
          gte(sql`COALESCE(${appointments.endTime}, ${now})`, now),
          eq(appointments.status, 'in_progress')
        )
      );

    // Get unique therapists from active sessions
    const activeTherapists = await db
      .selectDistinct({ therapistId: appointments.therapistId })
      .from(appointments)
      .where(
        and(
          lte(appointments.startTime, now),
          gte(sql`COALESCE(${appointments.endTime}, ${now})`, now),
          eq(appointments.status, 'in_progress')
        )
      );

    // Get unique patients from active appointments
    const activePatients = await db
      .selectDistinct({ patientId: appointments.patientId })
      .from(appointments)
      .where(
        and(
          lte(appointments.startTime, now),
          gte(sql`COALESCE(${appointments.endTime}, ${now})`, now),
          sql`${appointments.status} IN ('in_progress', 'confirmed', 'checked_in')`
        )
      );

    // Today's completed sessions
    const [completedTodayResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, todayStart),
          lte(appointments.startTime, todayEnd),
          eq(appointments.status, 'completed')
        )
      );

    // Today's scheduled sessions
    const [scheduledTodayResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, todayStart),
          lte(appointments.startTime, todayEnd)
        )
      );

    // New patients today
    const [newPatientsTodayResult] = await db
      .select({ count: count() })
      .from(patients)
      .where(
        and(
          gte(patients.createdAt, todayStart),
          lte(patients.createdAt, todayEnd)
        )
      );

    // Revenue today (from completed sessions - would need transactions table)
    const revenueToday = 0; // Placeholder

    // Upcoming appointments (next 5)
    const upcomingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, now),
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      )
      .orderBy(appointments.startTime)
      .limit(5);

    // Generate alerts
    const alerts = [];
    const noShowCount = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, todayStart),
          lte(appointments.startTime, todayEnd),
          eq(appointments.status, 'no_show')
        )
      );

    if ((noShowCount[0]?.count || 0) > 2) {
      alerts.push({
        id: '1',
        type: 'warning' as const,
        message: `${noShowCount[0]?.count || 0} pacientes não compareceram hoje`,
        time: 'Agora',
      });
    }

    if ((activeSessionsResult[0]?.count || 0) > 0) {
      alerts.push({
        id: '2',
        type: 'info' as const,
        message: `${activeSessionsResult[0]?.count || 0} sessões em andamento`,
        time: 'Agora',
      });
    }

    if ((completedTodayResult[0]?.count || 0) >= (scheduledTodayResult[0]?.count || 0) * 0.8 && (scheduledTodayResult[0]?.count || 0) > 0) {
      alerts.push({
        id: '3',
        type: 'success' as const,
        message: 'Ótimo progresso! 80% das sessões concluídas',
        time: 'Agora',
      });
    }

    return NextResponse.json({
      activeNow: {
        patients: activePatients.length,
        therapists: activeTherapists.length,
        sessionsInProgress: activeSessionsResult[0]?.count || 0,
      },
      todayMetrics: {
        completedSessions: completedTodayResult[0]?.count || 0,
        scheduledSessions: scheduledTodayResult[0]?.count || 0,
        revenue: revenueToday,
        newPatients: newPatientsTodayResult[0]?.count || 0,
      },
      upcomingAppointments: upcomingAppointments.map((apt) => ({
        id: apt.id,
        patientName: `Paciente ${apt.patientId.slice(0, 8)}...`,
        therapist: `Fisioterapeuta ${apt.therapistId.slice(0, 8)}...`,
        time: new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: apt.sessionType || 'Consulta',
      })),
      alerts,
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time analytics' },
      { status: 500 }
    );
  }
}
