import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyTasks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/daily-tasks/[id] - Update a daily task (e.g., mark as completed)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(dailyTasks)
      .set({
        title: body.title,
        points: body.points,
        completed: body.completed,
        date: body.date ? new Date(body.date) : undefined,
      })
      .where(eq(dailyTasks.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Daily task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating daily task:', error);
    return NextResponse.json(
      { error: 'Failed to update daily task' },
      { status: 500 }
    );
  }
}

// DELETE /api/daily-tasks/[id] - Delete a daily task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(dailyTasks).where(eq(dailyTasks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily task:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily task' },
      { status: 500 }
    );
  }
}
