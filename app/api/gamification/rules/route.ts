import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pointsRules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/gamification/rules - List all points rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const result = await withCache(
      `points-rules:${activeOnly ? 'active' : 'all'}`,
      async () => {
        return await db.query.pointsRules.findMany({
          where: activeOnly ? eq(pointsRules.isActive, true) : undefined,
          orderBy: [pointsRules.action],
        });
      },
      { ttl: 600 }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching points rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points rules' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/rules - Create a new points rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.action || body.points === undefined) {
      return NextResponse.json(
        { error: 'action and points are required' },
        { status: 400 }
      );
    }

    const newRule = await db.insert(pointsRules).values({
      action: body.action,
      points: body.points,
      description: body.description || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    }).returning();

    // Invalidate cache
    await invalidatePattern('points-rules:*');

    return NextResponse.json(newRule[0], { status: 201 });
  } catch (error) {
    console.error('Error creating points rule:', error);
    return NextResponse.json(
      { error: 'Failed to create points rule' },
      { status: 500 }
    );
  }
}
