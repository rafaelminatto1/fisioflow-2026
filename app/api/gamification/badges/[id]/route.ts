import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { badges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/gamification/badges/[id] - Get a single badge
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const badge = await db.query.badges.findFirst({
      where: eq(badges.id, id),
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error fetching badge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge' },
      { status: 500 }
    );
  }
}

// PUT /api/gamification/badges/[id] - Update a badge
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(badges)
      .set({
        name: body.name,
        description: body.description,
        icon: body.icon,
        category: body.category,
        requirementType: body.requirementType,
        requirementValue: body.requirementValue,
        points: body.points,
        isActive: body.isActive,
      })
      .where(eq(badges.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('badges:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json(
      { error: 'Failed to update badge' },
      { status: 500 }
    );
  }
}

// DELETE /api/gamification/badges/[id] - Delete a badge
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(badges)
      .where(eq(badges.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('badges:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Failed to delete badge' },
      { status: 500 }
    );
  }
}
