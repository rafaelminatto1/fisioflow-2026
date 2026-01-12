import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/assessments/progress - Get assessment progress for a patient
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

    const cacheKey = `assessment-progress:${patientId}`;

    const progress = await withCache(
      cacheKey,
      async () => {
        return await db.query.assessmentProgress.findFirst({
          where: eq(assessmentProgress.patientId, patientId),
          with: {
            patient: true,
          },
        });
      },
      { ttl: 180 }
    );

    if (!progress) {
      return NextResponse.json(
        { message: 'No assessment progress found for this patient' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching assessment progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment progress' },
      { status: 500 }
    );
  }
}
