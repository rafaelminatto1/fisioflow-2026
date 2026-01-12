import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/telemedicine/sessions/[id] - Get a single session
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await db.query.telemedicineSessions.findFirst({
      where: eq(telemedicineSessions.id, id),
      with: {
        patient: true,
        therapist: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Telemedicine session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch telemedicine session' },
      { status: 500 }
    );
  }
}

// PUT /api/telemedicine/sessions/[id] - Update a session
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(telemedicineSessions)
      .set({
        patientId: body.patientId,
        therapistId: body.therapistId,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
        duration: body.duration,
        status: body.status,
        roomUrl: body.roomUrl,
        roomPassword: body.roomPassword,
        notes: body.notes,
        cancelledAt: body.status === 'cancelled' ? new Date() : undefined,
        completedAt: body.status === 'completed' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(telemedicineSessions.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Telemedicine session not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('telemedicine-sessions:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to update telemedicine session' },
      { status: 500 }
    );
  }
}

// DELETE /api/telemedicine/sessions/[id] - Delete a session
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(telemedicineSessions)
      .where(eq(telemedicineSessions.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Telemedicine session not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('telemedicine-sessions:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to delete telemedicine session' },
      { status: 500 }
    );
  }
}
