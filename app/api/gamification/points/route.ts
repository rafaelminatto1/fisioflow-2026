import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pointsHistory, patients } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/gamification/points - Get points history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const cacheKey = `points-history:${patientId}`;

    const history = await withCache(
      cacheKey,
      async () => {
        return await db.query.pointsHistory.findMany({
          where: eq(pointsHistory.patientId, patientId),
          orderBy: [desc(pointsHistory.createdAt)],
          limit: 100,
        });
      },
      { ttl: 180 }
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching points history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points history' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/points - Award/deduct points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || body.points === undefined || !body.description) {
      return NextResponse.json(
        { error: 'patientId, points, and description are required' },
        { status: 400 }
      );
    }

    // Award/deduct points
    const newHistory = await db.insert(pointsHistory).values({
      patientId: body.patientId,
      points: body.points,
      source: body.source || 'manual',
      sourceId: body.sourceId || null,
      description: body.description,
    }).returning();

    // Update patient total points
    await db.update(patients)
      .set({
        totalPoints: sql`total_points + ${body.points}`,
      })
      .where(eq(patients.id, body.patientId));

    // Invalidate cache
    await invalidatePattern(`points-history:${body.patientId}:*`);
    await invalidatePattern(`patient:${body.patientId}:*`);

    return NextResponse.json(newHistory[0], { status: 201 });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}
