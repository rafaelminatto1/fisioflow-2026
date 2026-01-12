import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notificationPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const prefs = await db.query.notificationPreferences.findMany({
      where: eq(notificationPreferences.userId, userId),
    });

    // Convert to object
    const prefsObj = prefs.reduce((acc: any, p) => {
      acc[p.channel] = p.enabled;
      return acc;
    }, {
      email: true,
      push: true,
      sms: false,
      whatsapp: false,
    });

    return NextResponse.json({
      userId,
      preferences: prefsObj,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/preferences - Update notification preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.preferences) {
      return NextResponse.json(
        { error: 'userId and preferences are required' },
        { status: 400 }
      );
    }

    const channels = ['email', 'push', 'sms', 'whatsapp'];

    for (const channel of channels) {
      const enabled = body.preferences[channel] !== undefined
        ? body.preferences[channel]
        : channel === 'email' || channel === 'push'; // default true for email/push

      const existing = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, body.userId),
      });

      // Check if specific channel pref exists
      const channelPref = existing
        ? await db.query.notificationPreferences.findFirst({
            where: eq(notificationPreferences.channel, channel),
          })
        : null;

      if (channelPref) {
        await db.update(notificationPreferences)
          .set({ enabled, updatedAt: new Date() })
          .where(eq(notificationPreferences.id, channelPref.id));
      } else {
        await db.insert(notificationPreferences).values({
          userId: body.userId,
          channel,
          enabled,
        });
      }
    }

    // Invalidate cache
    await invalidatePattern(`notifications:${body.userId}:*`);

    return NextResponse.json({
      success: true,
      preferences: body.preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
