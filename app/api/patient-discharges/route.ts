import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientDischarges, patients, patientSessions, staff } from '@/db/schema';
import { eq, desc, count, sql, and, gte, lte } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// GET /api/patient-discharges - List patient discharges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const reason = searchParams.get('reason');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = `patient-discharges:${patientId || 'all'}:${reason || 'all'}:${limit}`;

    const discharges = await withCache(
      cacheKey,
      async () => {
        return await db.query.patientDischarges.findMany({
          where: patientId ? eq(patientDischarges.patientId, patientId) : undefined,
          with: {
            patient: true,
            dischargedByStaff: true,
            approvedByStaff: true,
          },
          orderBy: [desc(patientDischarges.dischargeDate)],
          limit,
        });
      },
      { ttl: 180 }
    );

    // Apply additional filters
    let filtered = discharges;

    if (reason) {
      filtered = filtered.filter(d => d.reason === reason);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(d => new Date(d.dischargeDate) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(d => new Date(d.dischargeDate) <= end);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching patient discharges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient discharges' },
      { status: 500 }
    );
  }
}

// POST /api/patient-discharges - Create a patient discharge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.reason || !body.treatmentSummary) {
      return NextResponse.json(
        { error: 'patientId, reason, and treatmentSummary are required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, body.patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Count total sessions for this patient
    const sessionsResult = await db
      .select({ count: count() })
      .from(patientSessions)
      .where(eq(patientSessions.patientId, body.patientId));
    const sessionCount = sessionsResult[0]?.count || 0;

    // Create the discharge record
    const newDischarge = await db.insert(patientDischarges).values({
      patientId: body.patientId,
      dischargeDate: body.dischargeDate ? new Date(body.dischargeDate) : new Date(),
      reason: body.reason,
      primaryDiagnosis: body.primaryDiagnosis || null,
      secondaryDiagnoses: body.secondaryDiagnoses || null,
      treatmentSummary: body.treatmentSummary,
      initialAssessment: body.initialAssessment || null,
      finalAssessment: body.finalAssessment || null,
      outcomes: body.outcomes || null,
      painLevelInitial: body.painLevelInitial || null,
      painLevelFinal: body.painLevelFinal || null,
      functionalGain: body.functionalGain || null,
      sessionCount: sessionCount,
      recommendations: body.recommendations || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      homeCareInstructions: body.homeCareInstructions || null,
      attachments: body.attachments || null,
      dischargedBy: body.dischargedBy || null,
      approvedBy: body.approvedBy || null,
    }).returning();

    // Update patient status to inactive
    await db.update(patients)
      .set({ isActive: false })
      .where(eq(patients.id, body.patientId));

    // Send WhatsApp notification if patient has a phone number
    if (patient.phone && body.sendNotification !== false) {
      try {
        const message = `Olá ${patient.fullName}! 🏥\n\nSeu tratamento na FisioFlow foi concluído.\n\n📋 Resumo:\n${body.treatmentSummary}\n\n${body.recommendations ? `📝 Recomendações:\n${body.recommendations}\n\n` : ''}${body.followUpDate ? `📅 Retorno marcado para: ${new Date(body.followUpDate).toLocaleDateString('pt-BR')}\n\n` : ''}Agradecemos a confiança! Desejamos saúde e bem-estar. 💙\n\nEquipe FisioFlow`;

        await sendWhatsAppMessage({
          number: patient.phone,
          text: message,
        });
      } catch (whatsappError) {
        console.error('Error sending WhatsApp discharge notification:', whatsappError);
        // Don't fail the discharge if WhatsApp fails
      }
    }

    // Invalidate caches
    await invalidatePattern('patient-discharges:*');
    await invalidatePattern(`patients:*`);

    return NextResponse.json(newDischarge[0], { status: 201 });
  } catch (error) {
    console.error('Error creating patient discharge:', error);
    return NextResponse.json(
      { error: 'Failed to create patient discharge' },
      { status: 500 }
    );
  }
}
