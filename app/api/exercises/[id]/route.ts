import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/exercises/[id] - Update an exercise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(exercises)
      .set({
        title: body.title,
        description: body.description,
        category: body.category,
        videoUrl: body.videoUrl,
      })
      .where(eq(exercises.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Delete an exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(exercises).where(eq(exercises.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
