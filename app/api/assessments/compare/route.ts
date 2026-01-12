import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientAssessments } from '@/db/schema';
import { inArray } from 'drizzle-orm';

// POST /api/assessments/compare - Compare multiple assessments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentIds } = body;

    if (!Array.isArray(assessmentIds) || assessmentIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 assessment IDs are required for comparison' },
        { status: 400 }
      );
    }

    // Fetch all patient assessments
    const assessmentList = await db
      .select()
      .from(patientAssessments)
      .where(inArray(patientAssessments.id, assessmentIds));

    if (assessmentList.length !== assessmentIds.length) {
      return NextResponse.json(
        { error: 'One or more assessments not found' },
        { status: 404 }
      );
    }

    // Sort by date
    const sortedAssessments = assessmentList.sort((a, b) =>
      new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
    );

    // Calculate differences between consecutive assessments
    const comparisons = [];
    for (let i = 1; i < sortedAssessments.length; i++) {
      const prev = sortedAssessments[i - 1];
      const curr = sortedAssessments[i];

      comparisons.push({
        from: {
          id: prev.id,
          date: prev.assessmentDate,
          score: prev.score,
          answers: prev.answers,
        },
        to: {
          id: curr.id,
          date: curr.assessmentDate,
          score: curr.score,
          answers: curr.answers,
        },
        scoreDifference: curr.score && prev.score ? curr.score - prev.score : null,
      });
    }

    return NextResponse.json({
      assessments: sortedAssessments,
      comparisons,
    });
  } catch (error) {
    console.error('Error comparing assessments:', error);
    return NextResponse.json(
      { error: 'Failed to compare assessments' },
      { status: 500 }
    );
  }
}
