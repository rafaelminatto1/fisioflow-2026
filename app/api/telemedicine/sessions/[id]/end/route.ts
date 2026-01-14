import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSessions, patientSessions, pointsHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';
import { sendSessionSummary, isWhatsAppAvailable } from '@/lib/whatsapp';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/telemedicine/sessions/[id]/end - End a telemedicine session and create clinical record
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { 
      notes, 
      subjective, 
      objective, 
      assessment, 
      plan,
      evaScore,
      sendSummary = false,
      duration 
    } = body;

    // Get session with patient details
    const session = await db.query.telemedicineSessions.findFirst({
      where: eq(telemedicineSessions.id, id),
      with: {
        patient: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Session has already been completed' },
        { status: 400 }
      );
    }

    // Calculate actual duration
    const startedAt = session.startedAt || session.scheduledFor;
    const actualDuration = duration || Math.round(
      (Date.now() - new Date(startedAt).getTime()) / (1000 * 60)
    );

    // Update telemedicine session
    const updated = await db.update(telemedicineSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        duration: actualDuration,
        notes: notes || session.notes,
        updatedAt: new Date(),
      })
      .where(eq(telemedicineSessions.id, id))
      .returning();

    // Create clinical session record (SOAP) if clinical data provided
    let clinicalSessionId = null;
    if (subjective || objective || assessment || plan) {
      const clinicalSession = await db.insert(patientSessions).values({
        patientId: session.patientId,
        date: new Date().toISOString().split('T')[0],
        subjective,
        objective,
        assessment,
        plan,
        evaScore: evaScore !== undefined ? evaScore : null,
        sessionType: 'telemedicina',
        duration: actualDuration,
        therapistNotes: notes,
      }).returning();

      clinicalSessionId = clinicalSession[0]?.id;
    }

    // Award gamification points
    if (session.patientId) {
      await db.insert(pointsHistory).values({
        patientId: session.patientId,
        points: 50,
        source: 'telemedicine_session',
        sourceId: id,
        description: 'Sessão de teleconsulta realizada',
      });

      // Update patient points
      await db.execute(`
        UPDATE patients 
        SET total_points = total_points + 50,
            last_active_date = NOW()
        WHERE id = '${session.patientId}'
      `);
    }

    // Send summary via WhatsApp if requested
    let summarySent = false;
    if (sendSummary && session.patient?.phone && isWhatsAppAvailable()) {
      const summaryText = [
        assessment ? `📋 Avaliação: ${assessment}` : null,
        plan ? `🎯 Plano: ${plan}` : null,
        evaScore !== undefined ? `📊 Escala de Dor: ${evaScore}/10` : null,
      ].filter(Boolean).join('\n\n') || 'Sessão de teleconsulta realizada com sucesso!';

      summarySent = await sendSessionSummary(
        session.patient.fullName || 'Paciente',
        session.patient.phone,
        summaryText
      );
    }

    // Invalidate cache
    await invalidatePattern('telemedicine-sessions:*');
    await invalidatePattern(`patient:${session.patientId}:*`);

    return NextResponse.json({
      sessionId: id,
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration,
      clinicalSessionId,
      pointsAwarded: 50,
      summarySent,
    });
  } catch (error) {
    console.error('Error ending telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to end telemedicine session' },
      { status: 500 }
    );
  }
}
