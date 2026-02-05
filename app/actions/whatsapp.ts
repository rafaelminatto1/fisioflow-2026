'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { appointments, patients, patientSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { 
  sendWhatsAppMessage, 
  sendWelcomeMessage, 
  sendSessionSummary as sendSessionSummaryWA,
  sendAppointmentReminder as sendReminderWA,
  sendBirthdayMessage,
  sendNoShowMessage,
  sendWaitlistNotification,
  sendPaymentConfirmation,
  sendLeadFirstContact,
  isWhatsAppAvailable
} from '@/lib/whatsapp';

/**
 * Envia um lembrete de agendamento via WhatsApp usando a Evolution API.
 */
export async function sendAppointmentReminder(appointmentId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    // Buscar dados do agendamento no banco
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        patient: true,
      },
    });

    if (!appointment || !appointment.patient) {
      return { success: false, message: 'Agendamento ou paciente não encontrado' };
    }

    const patient = appointment.patient;
    const appointmentDate = new Date(appointment.startTime);
    const appointmentTime = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const success = await sendReminderWA(
      patient.fullName || 'Paciente',
      patient.phone || '',
      appointmentDate,
      appointmentTime
    );

    if (success) {
      // Marcar como lembrete enviado
      await db.update(appointments)
        .set({ reminderSent: true })
        .where(eq(appointments.id, appointmentId));

      revalidatePath('/agenda');
      return { success: true, message: 'Lembrete de WhatsApp enviado com sucesso!' };
    }

    return { success: false, message: 'Falha ao enviar lembrete' };
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido ao processar o envio.' 
    };
  }
}

/**
 * Envia mensagem de boas-vindas para novo paciente
 */
export async function sendWelcomeMessageAction(patientId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
    });

    if (!patient) {
      return { success: false, message: 'Paciente não encontrado' };
    }

    if (!patient.phone) {
      return { success: false, message: 'Paciente não possui telefone cadastrado' };
    }

    const success = await sendWelcomeMessage(patient.fullName || 'Paciente', patient.phone);

    if (success) {
      revalidatePath('/patients');
      return { success: true, message: 'Mensagem de boas-vindas enviada!' };
    }

    return { success: false, message: 'Falha ao enviar mensagem' };
  } catch (error) {
    console.error('Erro ao enviar boas-vindas:', error);
    return { success: false, message: 'Erro ao enviar mensagem' };
  }
}

/**
 * Envia resumo da sessão SOAP para paciente
 */
export async function sendSessionSummary(sessionId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const session = await db.query.patientSessions.findFirst({
      where: eq(patientSessions.id, sessionId),
      with: {
        patient: true,
      },
    });

    if (!session || !session.patient) {
      return { success: false, message: 'Sessão ou paciente não encontrado' };
    }

    if (!session.patient.phone) {
      return { success: false, message: 'Paciente não possui telefone cadastrado' };
    }

    // Montar resumo da sessão
    const summaryParts = [];
    if (session.assessment) {
      summaryParts.push(`📋 Avaliação: ${session.assessment}`);
    }
    if (session.plan) {
      summaryParts.push(`🎯 Plano: ${session.plan}`);
    }
    if (session.evaScore !== null) {
      summaryParts.push(`📊 Escala de Dor: ${session.evaScore}/10`);
    }

    const summary = summaryParts.join('\n\n') || 'Sessão realizada com sucesso!';

    const success = await sendSessionSummaryWA(
      session.patient.fullName || 'Paciente',
      session.patient.phone,
      summary
    );

    if (success) {
      return { success: true, message: 'Resumo da sessão enviado!' };
    }

    return { success: false, message: 'Falha ao enviar resumo' };
  } catch (error) {
    console.error('Erro ao enviar resumo:', error);
    return { success: false, message: 'Erro ao enviar resumo' };
  }
}

/**
 * Envia mensagem de aniversário
 */
export async function sendBirthdayMessageAction(patientId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
    });

    if (!patient || !patient.phone) {
      return { success: false, message: 'Paciente não encontrado ou sem telefone' };
    }

    const success = await sendBirthdayMessage(patient.fullName || 'Paciente', patient.phone);

    return { success, message: success ? 'Mensagem de aniversário enviada!' : 'Falha ao enviar' };
  } catch (error) {
    console.error('Erro ao enviar aniversário:', error);
    return { success: false, message: 'Erro ao enviar mensagem' };
  }
}

/**
 * Envia mensagem para no-show (falta)
 */
export async function sendNoShowMessageAction(appointmentId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        patient: true,
      },
    });

    if (!appointment?.patient?.phone) {
      return { success: false, message: 'Dados não encontrados' };
    }

    const success = await sendNoShowMessage(
      appointment.patient.fullName || 'Paciente',
      appointment.patient.phone
    );

    return { success, message: success ? 'Mensagem de no-show enviada!' : 'Falha ao enviar' };
  } catch (error) {
    console.error('Erro ao enviar no-show:', error);
    return { success: false, message: 'Erro ao enviar mensagem' };
  }
}

/**
 * Envia notificação de vaga disponível na lista de espera
 */
export async function sendWaitlistNotificationAction(
  patientId: string,
  availableDate: string,
  availableTime: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
    });

    if (!patient?.phone) {
      return { success: false, message: 'Paciente não encontrado ou sem telefone' };
    }

    const success = await sendWaitlistNotification(
      patient.fullName || 'Paciente',
      patient.phone,
      availableDate,
      availableTime
    );

    return { success, message: success ? 'Notificação de vaga enviada!' : 'Falha ao enviar' };
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return { success: false, message: 'Erro ao enviar mensagem' };
  }
}

/**
 * Envia confirmação de pagamento
 */
export async function sendPaymentConfirmationAction(
  patientId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
    });

    if (!patient?.phone) {
      return { success: false, message: 'Paciente não encontrado ou sem telefone' };
    }

    const success = await sendPaymentConfirmation(
      patient.fullName || 'Paciente',
      patient.phone,
      amount,
      description
    );

    return { success, message: success ? 'Confirmação de pagamento enviada!' : 'Falha ao enviar' };
  } catch (error) {
    console.error('Erro ao enviar confirmação:', error);
    return { success: false, message: 'Erro ao enviar mensagem' };
  }
}

/**
 * Envia primeiro contato para lead
 */
export async function sendLeadFirstContactAction(
  leadId: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, message: 'WhatsApp não está configurado' };
    }

    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
    });

    if (!lead?.phone) {
      return { success: false, message: 'Lead não encontrado ou sem telefone' };
    }

    const success = await sendLeadFirstContact(
      lead.name || 'Olá',
      lead.phone,
      lead.notes || undefined
    );

    if (success) {
      // Atualizar status do lead para 'contacted'
      await db.update(leads)
        .set({ status: 'contacted', updatedAt: new Date() })
        .where(eq(leads.id, leadId));

      revalidatePath('/crm');
    }

    return { success, message: success ? 'Mensagem enviada!' : 'Falha ao enviar' };
  } catch (error) {
    console.error('Erro ao enviar contato:', error);
    return { success: false, message: 'Erro ao enviar mensagem' };
  }
}

// Import leads table
import { leads } from '@/db/schema';

/**
 * Processa lembretes automáticos de agendamentos para as próximas 24h
 */
export async function processAutomaticReminders(): Promise<{ 
  success: boolean; 
  sent: number; 
  failed: number;
  message: string;
}> {
  try {
    if (!isWhatsAppAvailable()) {
      return { success: false, sent: 0, failed: 0, message: 'WhatsApp não está configurado' };
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Buscar agendamentos das próximas 24-25h que ainda não receberam lembrete
    const upcomingAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.reminderSent, false),
        eq(appointments.status, 'scheduled'),
        gte(appointments.startTime, tomorrow),
        lte(appointments.startTime, in25Hours)
      ),
      with: {
        patient: true,
      },
    });

    let sent = 0;
    let failed = 0;

    for (const apt of upcomingAppointments) {
      if (!apt.patient?.phone) continue;

      const appointmentDate = new Date(apt.startTime);
      const appointmentTime = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const success = await sendReminderWA(
        apt.patient.fullName || 'Paciente',
        apt.patient.phone,
        appointmentDate,
        appointmentTime
      );

      if (success) {
        await db.update(appointments)
          .set({ reminderSent: true })
          .where(eq(appointments.id, apt.id));
        sent++;
      } else {
        failed++;
      }
    }

    return { 
      success: true, 
      sent, 
      failed, 
      message: `Processados ${sent + failed} lembretes: ${sent} enviados, ${failed} falharam` 
    };
  } catch (error) {
    console.error('Erro ao processar lembretes automáticos:', error);
    return { success: false, sent: 0, failed: 0, message: 'Erro ao processar lembretes' };
  }
}

// Import additional dependencies
import { and, gte, lte } from 'drizzle-orm';