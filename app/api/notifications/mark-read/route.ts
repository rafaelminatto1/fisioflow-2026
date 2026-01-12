import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// POST /api/notifications/mark-read - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.notificationIds && !body.userId) {
      return NextResponse.json(
        { error: 'notificationIds or userId is required' },
        { status: 400 }
      );
    }

    let updated;

    if (body.notificationIds && Array.isArray(body.notificationIds)) {
      // Mark specific notifications as read
      updated = await db.update(notifications)
        .set({
          read: true,
          readAt: new Date(),
        })
        .where(eq(notifications.id, body.notificationIds[0]))
        .returning();
    } else if (body.userId) {
      // Mark all notifications for user as read
      updated = await db.update(notifications)
        .set({
          read: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, body.userId),
            eq(notifications.read, false)
          )
        )
        .returning();
    }

    // Invalidate cache
    if (body.userId) {
      await invalidatePattern(`notifications:${body.userId}:*`);
    }

    return NextResponse.json({
      success: true,
      count: updated?.length || 0,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
