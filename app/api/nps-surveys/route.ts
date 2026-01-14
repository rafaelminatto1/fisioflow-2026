import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { npsSurveys, patients } from '@/db/schema';
import { eq, desc, and, gte, lte, sql, count } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

// GET /api/nps-surveys - List NPS surveys or get NPS score
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // 'list' or 'score'
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'score') {
      // Calculate NPS score
      const cacheKey = `nps-score:${startDate || 'all'}:${endDate || 'all'}`;

      const npsData = await withCache(
        cacheKey,
        async () => {
          let query = db.select().from(npsSurveys);

          if (startDate) {
            query = query.where(gte(npsSurveys.answeredAt, new Date(startDate))) as any;
          }
          if (endDate) {
            query = query.where(lte(npsSurveys.answeredAt, new Date(endDate))) as any;
          }

          const surveys = await query;

          if (surveys.length === 0) {
            return {
              npsScore: null,
              promoters: 0,
              passives: 0,
              detractors: 0,
              total: 0,
              promoterPercentage: 0,
              detractorPercentage: 0,
            };
          }

          const promoters = surveys.filter(s => s.score >= 9).length;
          const passives = surveys.filter(s => s.score >= 7 && s.score <= 8).length;
          const detractors = surveys.filter(s => s.score <= 6).length;
          const total = surveys.length;

          const promoterPercentage = (promoters / total) * 100;
          const detractorPercentage = (detractors / total) * 100;
          const npsScore = Math.round(promoterPercentage - detractorPercentage);

          return {
            npsScore,
            promoters,
            passives,
            detractors,
            total,
            promoterPercentage: Math.round(promoterPercentage),
            detractorPercentage: Math.round(detractorPercentage),
          };
        },
        { ttl: 300 }
      );

      return NextResponse.json(npsData);
    }

    // List surveys
    const cacheKey = `nps-surveys:${patientId || 'all'}:${limit}`;

    const surveys = await withCache(
      cacheKey,
      async () => {
        return await db.query.npsSurveys.findMany({
          where: patientId ? eq(npsSurveys.patientId, patientId) : undefined,
          with: {
            patient: true,
          },
          orderBy: [desc(npsSurveys.createdAt)],
          limit,
        });
      },
      { ttl: 120 }
    );

    // Apply date filters
    let filtered = surveys;

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(s => s.answeredAt && new Date(s.answeredAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(s => s.answeredAt && new Date(s.answeredAt) <= end);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching NPS surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NPS surveys' },
      { status: 500 }
    );
  }
}

// POST /api/nps-surveys - Create and optionally send a new NPS survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, body.patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // If score is provided, this is a response submission
    if (body.score !== undefined) {
      const score = parseInt(body.score);
      if (isNaN(score) || score < 0 || score > 10) {
        return NextResponse.json(
          { error: 'score must be a number between 0 and 10' },
          { status: 400 }
        );
      }

      const newSurvey = await db.insert(npsSurveys).values({
        patientId: body.patientId,
        sessionId: body.sessionId || null,
        score: score,
        feedback: body.feedback || null,
        isPromoter: score >= 9,
        isPassive: score >= 7 && score <= 8,
        isDetractor: score <= 6,
        answeredAt: new Date(),
      }).returning();

      // Invalidate cache
      await invalidatePattern('nps-surveys:*');
      await invalidatePattern('nps-score:*');

      return NextResponse.json(newSurvey[0], { status: 201 });
    }

    // Otherwise, create a pending survey and optionally send via WhatsApp
    const newSurvey = await db.insert(npsSurveys).values({
      patientId: body.patientId,
      sessionId: body.sessionId || null,
      score: 0, // Placeholder, will be updated when answered
      sentAt: body.sendNow ? new Date() : null,
    }).returning();

    // Send WhatsApp survey if requested
    if (body.sendNow && patient.phone) {
      const surveyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.fisioflow.com'}/nps/${newSurvey[0].id}`;
      
      const message = `Olá ${patient.fullName}! 👋\n\nGostaríamos de saber sua opinião sobre o atendimento na FisioFlow.\n\nDe 0 a 10, qual a probabilidade de você recomendar nossos serviços para um amigo ou familiar?\n\n📋 Responda aqui: ${surveyLink}\n\nSua opinião é muito importante para nós! 💙`;

      await sendWhatsAppMessage({
        number: patient.phone,
        text: message,
      });
    }

    // Invalidate cache
    await invalidatePattern('nps-surveys:*');

    return NextResponse.json(newSurvey[0], { status: 201 });
  } catch (error) {
    console.error('Error creating NPS survey:', error);
    return NextResponse.json(
      { error: 'Failed to create NPS survey' },
      { status: 500 }
    );
  }
}
