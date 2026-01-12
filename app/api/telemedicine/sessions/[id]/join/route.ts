import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/telemedicine/sessions/[id]/join - Join a telemedicine session
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get session
    const session = await db.query.telemedicineSessions.findFirst({
      where: eq(telemedicineSessions.id, id),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session is scheduled
    if (session.status !== 'scheduled' && session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Session is not available for joining' },
        { status: 400 }
      );
    }

    // Update status to in_progress if not already
    if (session.status === 'scheduled') {
      await db.update(telemedicineSessions)
        .set({ status: 'in_progress', updatedAt: new Date() })
        .where(eq(telemedicineSessions.id, id));

      await invalidatePattern('telemedicine-sessions:*');
    }

    // Return join URL
    // In production, you would generate a proper meeting room URL using the provider's API
    const joinUrl = session.roomUrl || `https://whereby.com/fisioflow-${id.substring(0, 8)}`;

    return NextResponse.json({
      sessionId: id,
      roomUrl: joinUrl,
      password: session.roomPassword,
      status: 'in_progress',
    });
  } catch (error) {
    console.error('Error joining telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to join telemedicine session' },
      { status: 500 }
    );
  }
}
