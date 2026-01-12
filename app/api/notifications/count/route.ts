import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/notifications/count - Get unread notification count
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

    const cacheKey = `notifications:count:${userId}`;

    const result = await withCache(
      cacheKey,
      async () => {
        const count = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM notifications
          WHERE user_id = ${userId}
            AND read = false
        `);

        return {
          userId,
          unreadCount: Number(count[0]?.count || 0),
        };
      },
      { ttl: 60 } // 1 minute cache
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification count' },
      { status: 500 }
    );
  }
}
