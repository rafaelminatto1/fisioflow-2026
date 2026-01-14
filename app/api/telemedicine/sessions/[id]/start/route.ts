import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSessions, patients, staff, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';
import { sendWhatsAppMessage, isWhatsAppAvailable } from '@/lib/whatsapp';
import { nanoid } from 'nanoid';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/telemedicine/sessions/[id]/start - Start a telemedicine session (therapist side)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { therapistId, notifyPatient } = body;

    // Get session with patient and therapist details
    const session = await db.query.telemedicineSessions.findFirst({
      where: eq(telemedicineSessions.id, id),
      with: {
        patient: true,
        therapist: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session can be started
    if (session.status === 'completed' || session.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Session has already ended or was cancelled' },
        { status: 400 }
      );
    }

    // Generate unique room ID if not exists
    const roomId = session.roomUrl ? session.roomUrl.split('/').pop() : `fisioflow-${nanoid(10)}`;
    
    // Generate room URL (using Whereby-style URLs - can be adapted for other providers)
    // In production, integrate with actual video provider API
    const roomUrl = session.roomUrl || `https://whereby.com/${roomId}`;
    const roomPassword = session.roomPassword || nanoid(6).toUpperCase();

    // Update session
    const updated = await db.update(telemedicineSessions)
      .set({
        status: 'in_progress',
        roomUrl,
        roomPassword,
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(telemedicineSessions.id, id))
      .returning();

    // Notify patient via WhatsApp
    let patientNotified = false;
    if (notifyPatient && session.patient?.phone && isWhatsAppAvailable()) {
      const message = `Olá ${session.patient.fullName}! 📹\n\nSua sessão de teleconsulta está pronta para começar.\n\n🔗 Link: ${roomUrl}\n🔑 Senha: ${roomPassword}\n\nClique no link para entrar na sala. Te aguardamos!`;
      
      const result = await sendWhatsAppMessage({
        number: session.patient.phone,
        text: message,
      });
      
      patientNotified = result !== null;
    }

    // Create in-app notification for patient if they have a user account
    // (assuming patient might be linked to a user)

    // Invalidate cache
    await invalidatePattern('telemedicine-sessions:*');

    return NextResponse.json({
      sessionId: id,
      status: 'in_progress',
      roomUrl,
      roomPassword,
      startedAt: new Date().toISOString(),
      patientNotified,
      hostUrl: `${roomUrl}?displayName=${encodeURIComponent(session.therapist?.name || 'Fisioterapeuta')}`,
      guestUrl: `${roomUrl}?displayName=${encodeURIComponent(session.patient?.fullName || 'Paciente')}`,
    });
  } catch (error) {
    console.error('Error starting telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to start telemedicine session' },
      { status: 500 }
    );
  }
}
