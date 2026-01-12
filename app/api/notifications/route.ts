import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const whereClause = unreadOnly
      ? eq(notifications.userId, userId)
      : eq(notifications.userId, userId);

    const notifList = await db.query.notifications.findMany({
      where: whereClause,
      orderBy: [desc(notifications.createdAt)],
      limit,
    });

    // Filter unread in memory if needed
    const filtered = unreadOnly
      ? notifList.filter((n) => !n.read)
      : notifList;

    // Get unread count
    const unreadCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId}
        AND read = false
    `);

    return NextResponse.json({
      notifications: filtered,
      unreadCount: Number(unreadCount[0]?.count || 0),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'userId, type, title, and message are required' },
        { status: 400 }
      );
    }

    const newNotification = await db.insert(notifications).values({
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data || null,
      read: false,
    }).returning();

    // Invalidate cache
    await invalidatePattern(`notifications:${body.userId}:*`);

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
