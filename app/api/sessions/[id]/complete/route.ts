import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientSessions, patients, pointsHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendSessionSummary, isWhatsAppAvailable } from '@/lib/whatsapp';

// POST /api/sessions/[id]/complete - Complete a session and optionally send WhatsApp summary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sendWhatsApp = body.sendWhatsApp ?? false;

    // Get the session with patient data
    const session = await db.query.patientSessions.findFirst({
      where: eq(patientSessions.id, id),
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

    // Update session status if needed
    await db.update(patientSessions)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(patientSessions.id, id));

    // Award gamification points for completed session
    if (session.patientId) {
      try {
        await db.insert(pointsHistory).values({
          patientId: session.patientId,
          points: 50, // Points for completing a session
          source: 'session',
          sourceId: session.id,
          description: 'Sessão de fisioterapia realizada',
        });

        // Update patient's total points
        await db.execute(`
          UPDATE patients 
          SET total_points = total_points + 50,
              current_streak = current_streak + 1,
              last_active_date = NOW()
          WHERE id = '${session.patientId}'
        `);
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Don't fail the request if points fail
      }
    }

    // Send WhatsApp summary if requested
    let whatsAppSent = false;
    if (sendWhatsApp && session.patient?.phone && isWhatsAppAvailable()) {
      // Build summary message
      const summaryParts = [];
      
      if (session.assessment) {
        summaryParts.push(`📋 ${session.assessment}`);
      }
      if (session.plan) {
        summaryParts.push(`🎯 ${session.plan}`);
      }
      if (session.evaScore !== null) {
        summaryParts.push(`📊 Escala de Dor: ${session.evaScore}/10`);
      }

      const summary = summaryParts.length > 0 
        ? summaryParts.join('\n\n')
        : 'Sessão realizada com sucesso! Continue com os exercícios prescritos.';

      whatsAppSent = await sendSessionSummary(
        session.patient.fullName || 'Paciente',
        session.patient.phone,
        summary
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sessão finalizada com sucesso',
      whatsAppSent,
      pointsAwarded: 50,
    });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    );
  }
}
