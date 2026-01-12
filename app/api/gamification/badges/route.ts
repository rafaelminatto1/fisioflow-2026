import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { badges } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { withCache, invalidatePattern, CacheKeys } from '@/lib/vercel-kv';

// GET /api/gamification/badges - List all badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const category = searchParams.get('category');

    const cacheKey = `badges:${activeOnly ? 'active' : 'all'}${category ? `:${category}` : ''}`;

    const allBadges = await withCache(
      cacheKey,
      async () => {
        let whereClause = undefined;

        if (activeOnly) {
          whereClause = eq(badges.isActive, true);
        } else if (category) {
          whereClause = eq(badges.category, category);
        }

        return await db.query.badges.findMany({
          orderBy: [desc(badges.createdAt)],
          where: whereClause,
        });
      },
      { ttl: 600 } // 10 minutes cache
    );

    return NextResponse.json(allBadges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/badges - Create a new badge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.category || !body.requirementType || body.requirementValue === undefined) {
      return NextResponse.json(
        { error: 'name, category, requirementType, and requirementValue are required' },
        { status: 400 }
      );
    }

    const newBadge = await db.insert(badges).values({
      name: body.name,
      description: body.description || null,
      icon: body.icon || null,
      category: body.category,
      requirementType: body.requirementType,
      requirementValue: body.requirementValue,
      points: body.points || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    }).returning();

    // Invalidate cache
    await invalidatePattern('badges:*');

    return NextResponse.json(newBadge[0], { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
