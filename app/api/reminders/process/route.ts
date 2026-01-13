import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients, reminderRules } from '@/db/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { format, addHours, addDays } from 'date-fns';
import { sendAppointmentReminder } from '@/lib/whatsapp';

// Helper to replace template variables
function replaceTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// Helper to format date in Portuguese
function formatDate(date: Date): string {
  return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: require('date-fns/locale/pt-BR') });
}

// POST /api/reminders/process - Process and send pending reminders
export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Get all active reminder rules
    const rules = await db.select().from(reminderRules).where(eq(reminderRules.isActive, true));

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const rule of rules) {
      // Parse trigger to determine timing
      const triggerHoursBefore = parseInt(rule.trigger.match(/(\d+)h/)?.[1] || '0');
      const triggerDaysBefore = parseInt(rule.trigger.match(/(\d+)d/)?.[1] || '0');

      // Calculate the appointment time window for this rule
      let appointmentWindowStart = addHours(now, triggerHoursBefore);
      appointmentWindowStart = addDays(appointmentWindowStart, triggerDaysBefore);
      const appointmentWindowEnd = addHours(appointmentWindowStart, 1);

      // Find appointments in the window that haven't been reminded
      const appointmentsToRemind = await db
        .select({
          appointment: appointments,
          patient: patients,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(
          and(
            gte(appointments.startTime, appointmentWindowStart),
            lte(appointments.startTime, appointmentWindowEnd),
            eq(appointments.reminderSent, false)
          )
        );

      for (const { appointment, patient } of appointmentsToRemind) {
        results.processed++;

        const appointmentDate = new Date(appointment.startTime);
        const appointmentTime = format(appointmentDate, 'HH:mm');

        const variables = {
          nome: patient.fullName || 'Paciente',
          telefone: patient.phone || '',
          email: patient.email || '',
          data: format(appointmentDate, 'dd/MM/yyyy'),
          horario: appointmentTime,
          clinica: 'FisioFlow Clínica',
        };

        const message = replaceTemplate(rule.template, variables);

        let sent = false;
        if (rule.channel === 'whatsapp') {
          sent = await sendAppointmentReminder(
            variables.nome,
            variables.telefone,
            appointmentDate,
            appointmentTime
          );
        } else if (rule.channel === 'email') {
          // TODO: Implement email sending
          console.log('Email reminder would be sent:', message);
          sent = true; // Placeholder
        }

        if (sent) {
          results.sent++;
          // Mark appointment as reminded
          await db.update(appointments)
            .set({ reminderSent: true })
            .where(eq(appointments.id, appointment.id));
        } else {
          results.failed++;
        }

        results.details.push({
          ruleId: rule.id,
          ruleName: rule.name,
          appointmentId: appointment.id,
          patientId: patient.id,
          patientName: variables.nome,
          sent,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
