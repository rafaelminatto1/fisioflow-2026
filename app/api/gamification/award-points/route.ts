import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/gamification/award-points - Award points to a patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, points, reason } = body;

    if (!patientId || typeof points !== 'number') {
      return NextResponse.json(
        { error: 'patientId and points are required' },
        { status: 400 }
      );
    }

    // Get current patient data
    const patientList = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId));

    if (!patientList.length) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patient = patientList[0];
    const currentPoints = (patient as any).totalPoints || 0;
    const newPoints = currentPoints + points;

    // Update patient points
    await db
      .update(patients)
      .set({
        totalPoints: newPoints,
        updatedAt: new Date(),
      } as any)
      .where(eq(patients.id, patientId));

    return NextResponse.json({
      success: true,
      patientId,
      previousPoints: currentPoints,
      pointsAwarded: points,
      newTotalPoints: newPoints,
      reason,
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}
