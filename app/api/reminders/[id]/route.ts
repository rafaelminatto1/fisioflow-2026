import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reminderRules } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/reminders/[id] - Update a reminder rule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [rule] = await db.update(reminderRules)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(reminderRules.id, id))
      .returning();

    if (!rule) {
      return NextResponse.json(
        { error: 'Reminder rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error updating reminder rule:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder rule' },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders/[id] - Delete a reminder rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.delete(reminderRules).where(eq(reminderRules.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder rule' },
      { status: 500 }
    );
  }
}
