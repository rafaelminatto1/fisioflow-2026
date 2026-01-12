import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientAssessments, assessmentProgress, assessmentTemplates } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/assessments/patient - Get patient assessments
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

    const assessments = await db.query.patientAssessments.findMany({
      where: eq(patientAssessments.patientId, patientId),
      with: {
        patient: true,
        template: true,
        assessedByStaff: true,
      },
      orderBy: [desc(patientAssessments.assessmentDate)],
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching patient assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient assessments' },
      { status: 500 }
    );
  }
}

// POST /api/assessments/patient - Submit a patient assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.templateId || !body.answers) {
      return NextResponse.json(
        { error: 'patientId, templateId, and answers are required' },
        { status: 400 }
      );
    }

    // Calculate score based on template
    const template = await db.query.assessmentTemplates.findFirst({
      where: eq(assessmentTemplates.id, body.templateId),
    });

    let calculatedScore = body.score;
    if (template && template.scoringMethod) {
      // Simple calculation - sum all numeric answers
      const numericAnswers = Object.values(body.answers).filter(
        (v: any) => typeof v === 'number'
      ) as number[];

      if (template.scoringMethod === 'sum') {
        calculatedScore = numericAnswers.reduce((a, b) => a + b, 0);
      } else if (template.scoringMethod === 'average') {
        calculatedScore = numericAnswers.length > 0
          ? Math.round(numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length)
          : 0;
      }
    }

    // Create patient assessment
    const newAssessment = await db.insert(patientAssessments).values({
      patientId: body.patientId,
      templateId: body.templateId,
      answers: body.answers,
      score: calculatedScore,
      notes: body.notes || null,
      assessedBy: body.assessedBy || null,
      assessmentDate: body.assessmentDate ? new Date(body.assessmentDate) : new Date(),
      nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : null,
    }).returning();

    // Update or create progress tracking
    const existingProgress = await db.query.assessmentProgress.findFirst({
      where: eq(assessmentProgress.patientId, body.patientId),
    });

    if (existingProgress) {
      await db.update(assessmentProgress)
        .set({
          previousScore: existingProgress.latestScore,
          latestScore: calculatedScore,
          improvement: existingProgress.latestScore
            ? Math.round(((calculatedScore - existingProgress.latestScore) / existingProgress.latestScore) * 100)
            : null,
          lastAssessmentDate: new Date(),
          nextAssessmentDue: body.nextDueDate ? new Date(body.nextDueDate) : existingProgress.nextAssessmentDue,
          updatedAt: new Date(),
        })
        .where(eq(assessmentProgress.id, existingProgress.id));
    } else {
      await db.insert(assessmentProgress).values({
        patientId: body.patientId,
        latestScore: calculatedScore,
        previousScore: null,
        improvement: null,
        lastAssessmentDate: new Date(),
        nextAssessmentDue: body.nextDueDate ? new Date(body.nextDueDate) : null,
      });
    }

    // Invalidate cache
    await invalidatePattern(`patient:${body.patientId}:*`);
    await invalidatePattern(`assessments:*`);

    return NextResponse.json(newAssessment[0], { status: 201 });
  } catch (error) {
    console.error('Error creating patient assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create patient assessment' },
      { status: 500 }
    );
  }
}
