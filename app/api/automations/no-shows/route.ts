import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients } from '@/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
import { sendNoShowMessage } from '@/lib/whatsapp';
import { format, subHours, startOfDay, endOfDay } from 'date-fns';

// POST /api/automations/no-shows - Process and send no-show follow-up messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hoursAgo = body.hoursAgo || 2; // Default: check appointments from 2 hours ago
    
    const now = new Date();
    const checkTime = subHours(now, hoursAgo);

    // Find appointments that:
    // 1. Were scheduled for before the check time
    // 2. Are still marked as 'scheduled' (not completed, cancelled, etc.)
    // 3. Haven't had a no-show message sent yet
    const noShowAppointments = await db
      .select({
        appointment: appointments,
        patient: patients,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(
        and(
          lt(appointments.startTime, checkTime),
          eq(appointments.status, 'scheduled'),
          sql`COALESCE((${appointments}.notes)::text, '') NOT LIKE '%[NO_SHOW_MESSAGE_SENT]%'`
        )
      );

    const results = {
      found: noShowAppointments.length,
      sent: 0,
      failed: 0,
      updated: 0,
      details: [] as any[],
    };

    for (const { appointment, patient } of noShowAppointments) {
      // Update appointment status to 'no_show'
      await db.update(appointments)
        .set({
          status: 'no_show',
          notes: `${appointment.notes || ''} [NO_SHOW_MESSAGE_SENT at ${format(now, 'dd/MM/yyyy HH:mm')}]`,
        })
        .where(eq(appointments.id, appointment.id));
      
      results.updated++;

      // Send WhatsApp message if patient has phone
      if (!patient.phone) {
        results.failed++;
        results.details.push({
          appointmentId: appointment.id,
          patientId: patient.id,
          patientName: patient.fullName,
          scheduledTime: appointment.startTime,
          status: 'skipped',
          reason: 'No phone number',
        });
        continue;
      }

      const sent = await sendNoShowMessage(
        patient.fullName || 'Paciente',
        patient.phone
      );

      if (sent) {
        results.sent++;
        results.details.push({
          appointmentId: appointment.id,
          patientId: patient.id,
          patientName: patient.fullName,
          phone: patient.phone,
          scheduledTime: appointment.startTime,
          status: 'sent',
        });
      } else {
        results.failed++;
        results.details.push({
          appointmentId: appointment.id,
          patientId: patient.id,
          patientName: patient.fullName,
          phone: patient.phone,
          scheduledTime: appointment.startTime,
          status: 'failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `No-show follow-up processed for appointments before ${format(checkTime, 'dd/MM/yyyy HH:mm')}`,
      ...results,
    });
  } catch (error) {
    console.error('Error processing no-show messages:', error);
    return NextResponse.json(
      { error: 'Failed to process no-show messages' },
      { status: 500 }
    );
  }
}

// GET /api/automations/no-shows - Get no-show statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const today = new Date();
    const start = startDate ? new Date(startDate) : startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
    const end = endDate ? new Date(endDate) : endOfDay(today);

    // Get all appointments in the period
    const allAppointments = await db
      .select({
        id: appointments.id,
        status: appointments.status,
        startTime: appointments.startTime,
        patientId: appointments.patientId,
      })
      .from(appointments)
      .where(
        and(
          sql`${appointments.startTime} >= ${start}`,
          sql`${appointments.startTime} <= ${end}`
        )
      );

    const total = allAppointments.length;
    const noShows = allAppointments.filter(a => a.status === 'no_show').length;
    const completed = allAppointments.filter(a => a.status === 'completed').length;
    const cancelled = allAppointments.filter(a => a.status === 'cancelled').length;

    // Get repeat no-show patients
    const noShowPatients = allAppointments
      .filter(a => a.status === 'no_show')
      .reduce((acc: any, a) => {
        acc[a.patientId!] = (acc[a.patientId!] || 0) + 1;
        return acc;
      }, {});

    const repeatNoShowPatients = Object.entries(noShowPatients)
      .filter(([_, count]) => (count as number) > 1)
      .map(([patientId, count]) => ({ patientId, noShowCount: count }));

    return NextResponse.json({
      period: {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
      },
      statistics: {
        totalAppointments: total,
        completed,
        noShows,
        cancelled,
        noShowRate: total > 0 ? Math.round((noShows / total) * 100) : 0,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      repeatNoShowPatients,
    });
  } catch (error) {
    console.error('Error fetching no-show statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch no-show statistics' },
      { status: 500 }
    );
  }
}
