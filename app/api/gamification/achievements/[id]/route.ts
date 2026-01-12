import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE /api/gamification/achievements/[id] - Revoke an achievement
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(achievements)
      .where(eq(achievements.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('achievements:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to revoke achievement' },
      { status: 500 }
    );
  }
}
