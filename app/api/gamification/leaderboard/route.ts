import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, achievements, pointsHistory } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/gamification/leaderboard - Get patient leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || 'all'; // 'all', 'week', 'month'

    const cacheKey = `leaderboard:${period}:${limit}`;

    const leaderboard = await withCache(
      cacheKey,
      async () => {
        let dateFilter = sql`TRUE`;
        const now = new Date();

        if (period === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = sql`${pointsHistory.createdAt} >= ${weekAgo}`;
        } else if (period === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = sql`${pointsHistory.createdAt} >= ${monthAgo}`;
        }

        // Get patients with their points and achievement count
        const result = await db.execute(sql`
          SELECT
            p.id,
            p.full_name as "fullName",
            p.total_points as "totalPoints",
            p.level,
            p.current_streak as "currentStreak",
            COUNT(a.id) as "badgeCount"
          FROM patients p
          LEFT JOIN achievements a ON p.id = a.patient_id
          WHERE p.is_active = true
          GROUP BY p.id, p.full_name, p.total_points, p.level, p.current_streak
          ORDER BY p.total_points DESC
          LIMIT ${limit}
        `);

        return result;
      },
      { ttl: 300 } // 5 minutes cache
    );

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
