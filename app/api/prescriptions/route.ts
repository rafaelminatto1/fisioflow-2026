import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prescriptions, exercises, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/prescriptions - List prescriptions with optional patient filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let allPrescriptions;

    if (patientId) {
      allPrescriptions = await db.select({
        id: prescriptions.id,
        patientId: prescriptions.patientId,
        exerciseId: prescriptions.exerciseId,
        frequency: prescriptions.frequency,
        active: prescriptions.active,
        notes: prescriptions.notes,
        createdAt: prescriptions.createdAt,
        exercise: {
          id: exercises.id,
          title: exercises.title,
          description: exercises.description,
          category: exercises.category,
          videoUrl: exercises.videoUrl,
        },
        patient: {
          id: patients.id,
          fullName: patients.fullName,
        },
      }).from(prescriptions)
        .leftJoin(exercises, eq(prescriptions.exerciseId, exercises.id))
        .leftJoin(patients, eq(prescriptions.patientId, patients.id))
        .where(eq(prescriptions.patientId, patientId));
    } else {
      allPrescriptions = await db.select({
        id: prescriptions.id,
        patientId: prescriptions.patientId,
        exerciseId: prescriptions.exerciseId,
        frequency: prescriptions.frequency,
        active: prescriptions.active,
        notes: prescriptions.notes,
        createdAt: prescriptions.createdAt,
        exercise: {
          id: exercises.id,
          title: exercises.title,
          description: exercises.description,
          category: exercises.category,
          videoUrl: exercises.videoUrl,
        },
        patient: {
          id: patients.id,
          fullName: patients.fullName,
        },
      }).from(prescriptions)
        .leftJoin(exercises, eq(prescriptions.exerciseId, exercises.id))
        .leftJoin(patients, eq(prescriptions.patientId, patients.id));
    }

    return NextResponse.json(allPrescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

// POST /api/prescriptions - Create a new prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.exerciseId) {
      return NextResponse.json(
        { error: 'patientId and exerciseId are required' },
        { status: 400 }
      );
    }

    const newPrescription = await db.insert(prescriptions).values({
      patientId: body.patientId,
      exerciseId: body.exerciseId,
      frequency: body.frequency || 'daily',
      active: body.active !== undefined ? body.active : true,
      notes: body.notes || null,
    }).returning();

    return NextResponse.json(newPrescription[0], { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
