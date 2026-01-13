import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { npsResponses, patients } from '@/db/schema';
import { eq, gte } from 'drizzle-orm';

// GET /api/surveys/nps - Get NPS statistics and responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const responses = await db.select()
      .from(npsResponses)
      .where(gte(npsResponses.respondedAt, startDate));

    // Calculate NPS score
    const promoters = responses.filter(r => r.score >= 9).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    const total = responses.length;

    const npsScore = total > 0
      ? Math.round(((promoters - detractors) / total) * 100)
      : 0;

    const scoreDistribution = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => ({
      score,
      count: responses.filter(r => r.score === score).length,
    }));

    const averageScore = total > 0
      ? responses.reduce((sum, r) => sum + r.score, 0) / total
      : 0;

    return NextResponse.json({
      npsScore,
      averageScore: Math.round(averageScore * 10) / 10,
      totalResponses: total,
      promoters,
      passives: responses.filter(r => r.score >= 7 && r.score <= 8).length,
      detractors,
      responseRate: 0, // Would calculate from sent surveys
      scoreDistribution,
      recentResponses: responses.slice(-10).reverse(),
    });
  } catch (error) {
    console.error('Error fetching NPS data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NPS data' },
      { status: 500 }
    );
  }
}

// POST /api/surveys/nps - Submit NPS response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, score, feedback, source } = body;

    if (!patientId || score === undefined) {
      return NextResponse.json(
        { error: 'patientId and score are required' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 10' },
        { status: 400 }
      );
    }

    const [response] = await db.insert(npsResponses).values({
      patientId,
      score,
      feedback: feedback || null,
      source: source || 'manual',
    }).returning();

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error saving NPS response:', error);
    return NextResponse.json(
      { error: 'Failed to save NPS response' },
      { status: 500 }
    );
  }
}
