import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessionWorkflow } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/sessions/[id]/workflow - Get session workflow status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflow = await db.select().from(sessionWorkflow)
      .where(eq(sessionWorkflow.sessionId, id))
      .limit(1);

    if (!workflow[0]) {
      // Create default workflow if doesn't exist
      const newWorkflow = await db.insert(sessionWorkflow).values({
        id: nanoid(),
        sessionId: id,
        status: 'scheduled',
      }).returning();
      return NextResponse.json(newWorkflow[0]);
    }

    return NextResponse.json(workflow[0]);
  } catch (error) {
    console.error('Error fetching session workflow:', error);
    return NextResponse.json({ error: 'Failed to fetch session workflow' }, { status: 500 });
  }
}

// PUT /api/sessions/[id]/workflow - Update session workflow status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {
      status: body.status,
      updatedAt: new Date(),
    };

    // Handle status-specific timestamps
    if (body.status === 'in_progress' && !body.startedAt) {
      updateData.startedAt = new Date();
    }
    if (body.status === 'completed' && !body.completedAt) {
      updateData.completedAt = new Date();
    }
    if (body.status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = body.cancelledBy || null;
      updateData.cancellationReason = body.cancellationReason || null;
    }
    if (body.notes) {
      updateData.notes = body.notes;
    }

    const workflow = await db.select().from(sessionWorkflow)
      .where(eq(sessionWorkflow.sessionId, id))
      .limit(1);

    let updated;
    if (workflow[0]) {
      updated = await db.update(sessionWorkflow)
        .set(updateData)
        .where(eq(sessionWorkflow.sessionId, id))
        .returning();
    } else {
      updated = await db.insert(sessionWorkflow).values({
        id: nanoid(),
        sessionId: id,
        ...updateData,
      }).returning();
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating session workflow:', error);
    return NextResponse.json({ error: 'Failed to update session workflow' }, { status: 500 });
  }
}
