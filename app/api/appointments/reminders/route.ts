import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sendAppointmentReminder, isWhatsAppAvailable } from '@/lib/whatsapp';

// POST /api/appointments/reminders - Process and send appointment reminders
// This should be called by a cron job every hour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hoursAhead = body.hoursAhead || 24; // Default 24h ahead

    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + (hoursAhead - 1) * 60 * 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    // Find appointments in the reminder window that haven't been reminded
    const upcomingAppointments = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        startTime: appointments.startTime,
        patientName: patients.fullName,
        patientPhone: patients.phone,
        patientEmail: patients.email,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(
        and(
          eq(appointments.status, 'scheduled'),
          eq(appointments.reminderSent, false),
          gte(appointments.startTime, reminderWindowStart),
          lte(appointments.startTime, reminderWindowEnd)
        )
      );

    const results = {
      total: upcomingAppointments.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
    };

    if (!isWhatsAppAvailable()) {
      return NextResponse.json({
        ...results,
        message: 'WhatsApp não está configurado. Nenhum lembrete enviado.',
      });
    }

    for (const apt of upcomingAppointments) {
      if (!apt.patientPhone) {
        results.skipped++;
        results.details.push({
          appointmentId: apt.id,
          patientName: apt.patientName,
          status: 'skipped',
          reason: 'Paciente sem telefone',
        });
        continue;
      }

      const appointmentDate = new Date(apt.startTime);
      const appointmentTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const success = await sendAppointmentReminder(
        apt.patientName || 'Paciente',
        apt.patientPhone,
        appointmentDate,
        appointmentTime
      );

      if (success) {
        results.sent++;
        
        // Mark as reminded
        await db.update(appointments)
          .set({ reminderSent: true })
          .where(eq(appointments.id, apt.id));

        results.details.push({
          appointmentId: apt.id,
          patientName: apt.patientName,
          status: 'sent',
        });
      } else {
        results.failed++;
        results.details.push({
          appointmentId: apt.id,
          patientName: apt.patientName,
          status: 'failed',
          reason: 'Erro ao enviar WhatsApp',
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processados ${results.total} agendamentos: ${results.sent} enviados, ${results.failed} falharam, ${results.skipped} ignorados`,
    });
  } catch (error) {
    console.error('Error processing appointment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process appointment reminders' },
      { status: 500 }
    );
  }
}

// GET /api/appointments/reminders - Get pending reminders count
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const pendingReminders = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        startTime: appointments.startTime,
        patientName: patients.fullName,
        patientPhone: patients.phone,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(
        and(
          eq(appointments.status, 'scheduled'),
          eq(appointments.reminderSent, false),
          gte(appointments.startTime, now),
          lte(appointments.startTime, next24Hours)
        )
      );

    return NextResponse.json({
      count: pendingReminders.length,
      appointments: pendingReminders,
      whatsAppAvailable: isWhatsAppAvailable(),
    });
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reminders' },
      { status: 500 }
    );
  }
}
