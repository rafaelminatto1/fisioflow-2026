import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { achievements, badges, patients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/gamification/achievements - List achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const badgeId = searchParams.get('badgeId');

    let cacheKey = 'achievements:all';
    let whereClause = undefined;

    if (patientId) {
      cacheKey = `achievements:patient:${patientId}`;
      whereClause = eq(achievements.patientId, patientId);
    } else if (badgeId) {
      cacheKey = `achievements:badge:${badgeId}`;
      whereClause = eq(achievements.badgeId, badgeId);
    }

    const result = await withCache(
      cacheKey,
      async () => {
        return await db.query.achievements.findMany({
          where: whereClause,
          with: {
            patient: true,
            badge: true,
          },
          orderBy: [desc(achievements.earnedAt)],
        });
      },
      { ttl: 300 }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/achievements - Create an achievement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.badgeId) {
      return NextResponse.json(
        { error: 'patientId and badgeId are required' },
        { status: 400 }
      );
    }

    // Check if achievement already exists
    const existing = await db.query.achievements.findFirst({
      where: and(
        eq(achievements.patientId, body.patientId),
        eq(achievements.badgeId, body.badgeId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Achievement already earned' },
        { status: 400 }
      );
    }

    // Create achievement
    const newAchievement = await db.insert(achievements).values({
      patientId: body.patientId,
      badgeId: body.badgeId,
    }).returning();

    // Get badge details for points
    const badge = await db.query.badges.findFirst({
      where: eq(badges.id, body.badgeId),
    });

    // Update patient points if badge has points
    if (badge && badge.points > 0) {
      await db.update(patients)
        .set({
          totalPoints: db.raw(`total_points + ${badge.points}`),
        })
        .where(eq(patients.id, body.patientId));
    }

    // Invalidate cache
    await invalidatePattern('achievements:*');
    await invalidatePattern(`patient:${body.patientId}:*`);

    return NextResponse.json(newAchievement[0], { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
