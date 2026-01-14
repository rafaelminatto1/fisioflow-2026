import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { npsSurveys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/nps-surveys/[id] - Get a specific NPS survey
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const survey = await db.query.npsSurveys.findFirst({
      where: eq(npsSurveys.id, id),
      with: {
        patient: true,
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: 'NPS survey not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error fetching NPS survey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NPS survey' },
      { status: 500 }
    );
  }
}

// PUT /api/nps-surveys/[id] - Update an NPS survey (submit response)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate score if provided
    if (body.score !== undefined) {
      const score = parseInt(body.score);
      if (isNaN(score) || score < 0 || score > 10) {
        return NextResponse.json(
          { error: 'score must be a number between 0 and 10' },
          { status: 400 }
        );
      }
      body.score = score;
      body.isPromoter = score >= 9;
      body.isPassive = score >= 7 && score <= 8;
      body.isDetractor = score <= 6;
      body.answeredAt = new Date();
    }

    const updated = await db.update(npsSurveys)
      .set({
        score: body.score,
        feedback: body.feedback,
        isPromoter: body.isPromoter,
        isPassive: body.isPassive,
        isDetractor: body.isDetractor,
        answeredAt: body.answeredAt,
      })
      .where(eq(npsSurveys.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'NPS survey not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('nps-surveys:*');
    await invalidatePattern('nps-score:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating NPS survey:', error);
    return NextResponse.json(
      { error: 'Failed to update NPS survey' },
      { status: 500 }
    );
  }
}

// DELETE /api/nps-surveys/[id] - Delete an NPS survey
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(npsSurveys)
      .where(eq(npsSurveys.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'NPS survey not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('nps-surveys:*');
    await invalidatePattern('nps-score:*');

    return NextResponse.json({ success: true, message: 'NPS survey deleted' });
  } catch (error) {
    console.error('Error deleting NPS survey:', error);
    return NextResponse.json(
      { error: 'Failed to delete NPS survey' },
      { status: 500 }
    );
  }
}
