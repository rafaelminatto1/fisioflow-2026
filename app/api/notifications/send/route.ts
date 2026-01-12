import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications, user, clinicSettings } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// POST /api/notifications/send - Send notification to users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      );
    }

    // Determine recipients
    let recipients: string[] = [];
    if (body.userId) {
      recipients = [body.userId];
    } else if (body.role) {
      // Get all users with a specific role
      const usersWithRole = await db.execute(sql`
        SELECT u.id
        FROM "user" u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name = ${body.role}
      `);
      recipients = usersWithRole.rows.map((r: any) => r.id);
    } else if (body.userIds && Array.isArray(body.userIds)) {
      recipients = body.userIds;
    } else {
      return NextResponse.json(
        { error: 'userId, role, or userIds is required' },
        { status: 400 }
      );
    }

    // Create notifications for all recipients
    const createdNotifications = [];
    for (const userId of recipients) {
      const notification = await db.insert(notifications).values({
        userId,
        type: body.type,
        title: body.title,
        message: body.message,
        data: body.data || null,
        read: false,
      }).returning();

      createdNotifications.push(notification[0]);
    }

    // Invalidate cache for all recipients
    for (const userId of recipients) {
      await invalidatePattern(`notifications:${userId}:*`);
    }

    // In production, would also send push/email/sms here based on user preferences
    // For now, just return the created notifications

    return NextResponse.json({
      success: true,
      sent: createdNotifications.length,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
