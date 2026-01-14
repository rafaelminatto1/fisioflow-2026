import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, appointments, patientSessions } from '@/db/schema';
import { eq, and, lt, desc, sql, max } from 'drizzle-orm';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { format, subDays, subMonths } from 'date-fns';

// POST /api/automations/inactive-patients - Send reactivation messages to inactive patients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inactiveDays = body.inactiveDays || 30; // Default: 30 days of inactivity
    
    const now = new Date();
    const inactiveThreshold = subDays(now, inactiveDays);

    // Find active patients who haven't had an appointment in X days
    // This query finds patients whose last appointment or session was before the threshold
    const inactivePatients = await db
      .select({
        id: patients.id,
        fullName: patients.fullName,
        phone: patients.phone,
        email: patients.email,
        lastActiveDate: patients.lastActiveDate,
        condition: patients.condition,
      })
      .from(patients)
      .where(
        and(
          eq(patients.isActive, true),
          sql`(${patients.lastActiveDate} IS NULL OR ${patients.lastActiveDate} < ${inactiveThreshold})`
        )
      );

    const results = {
      found: inactivePatients.length,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const patient of inactivePatients) {
      if (!patient.phone) {
        results.failed++;
        results.details.push({
          patientId: patient.id,
          name: patient.fullName,
          status: 'skipped',
          reason: 'No phone number',
        });
        continue;
      }

      // Personalized reactivation message
      const message = `Olá ${patient.fullName}! 👋\n\nSentimos sua falta na FisioFlow! Faz um tempo que não nos vemos.\n\n${patient.condition ? `Como está o seu tratamento para ${patient.condition}? ` : ''}Gostaria de agendar uma sessão de acompanhamento?\n\nEstamos aqui para ajudar você a continuar seu progresso! 💪\n\nResponda esta mensagem ou ligue para nós para agendar.\n\nEquipe FisioFlow 💙`;

      const result = await sendWhatsAppMessage({
        number: patient.phone,
        text: message,
      });

      if (result) {
        results.sent++;
        results.details.push({
          patientId: patient.id,
          name: patient.fullName,
          phone: patient.phone,
          lastActive: patient.lastActiveDate,
          status: 'sent',
        });
      } else {
        results.failed++;
        results.details.push({
          patientId: patient.id,
          name: patient.fullName,
          phone: patient.phone,
          lastActive: patient.lastActiveDate,
          status: 'failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reactivation messages processed for patients inactive for ${inactiveDays}+ days`,
      ...results,
    });
  } catch (error) {
    console.error('Error processing inactive patient messages:', error);
    return NextResponse.json(
      { error: 'Failed to process inactive patient messages' },
      { status: 500 }
    );
  }
}

// GET /api/automations/inactive-patients - Get list of inactive patients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inactiveDays = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const now = new Date();
    const inactiveThreshold = subDays(now, inactiveDays);

    const inactivePatients = await db
      .select({
        id: patients.id,
        fullName: patients.fullName,
        phone: patients.phone,
        email: patients.email,
        condition: patients.condition,
        lastActiveDate: patients.lastActiveDate,
        createdAt: patients.createdAt,
      })
      .from(patients)
      .where(
        and(
          eq(patients.isActive, true),
          sql`(${patients.lastActiveDate} IS NULL OR ${patients.lastActiveDate} < ${inactiveThreshold})`
        )
      )
      .orderBy(desc(patients.lastActiveDate))
      .limit(limit);

    // Calculate days inactive for each patient
    const patientsWithInactiveDays = inactivePatients.map(patient => {
      const lastActive = patient.lastActiveDate || patient.createdAt;
      const daysInactive = Math.floor((now.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...patient,
        daysInactive,
        lastActiveFormatted: format(new Date(lastActive), 'dd/MM/yyyy'),
      };
    });

    // Group by inactivity level
    const byInactivityLevel = {
      '30-60 days': patientsWithInactiveDays.filter(p => p.daysInactive >= 30 && p.daysInactive < 60),
      '60-90 days': patientsWithInactiveDays.filter(p => p.daysInactive >= 60 && p.daysInactive < 90),
      '90+ days': patientsWithInactiveDays.filter(p => p.daysInactive >= 90),
    };

    return NextResponse.json({
      threshold: `${inactiveDays}+ days inactive`,
      totalInactive: patientsWithInactiveDays.length,
      byInactivityLevel: {
        '30-60 days': byInactivityLevel['30-60 days'].length,
        '60-90 days': byInactivityLevel['60-90 days'].length,
        '90+ days': byInactivityLevel['90+ days'].length,
      },
      patients: patientsWithInactiveDays,
    });
  } catch (error) {
    console.error('Error fetching inactive patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inactive patients' },
      { status: 500 }
    );
  }
}
