import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pointsRules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/gamification/rules/[id] - Update a points rule
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(pointsRules)
      .set({
        action: body.action,
        points: body.points,
        description: body.description,
        isActive: body.isActive,
      })
      .where(eq(pointsRules.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Points rule not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('points-rules:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating points rule:', error);
    return NextResponse.json(
      { error: 'Failed to update points rule' },
      { status: 500 }
    );
  }
}

// DELETE /api/gamification/rules/[id] - Delete a points rule
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(pointsRules)
      .where(eq(pointsRules.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Points rule not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('points-rules:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting points rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete points rule' },
      { status: 500 }
    );
  }
}
