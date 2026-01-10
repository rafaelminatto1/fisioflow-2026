import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientSessions, patients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/sessions - List patient sessions with optional patient filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let allSessions;

    if (patientId) {
      allSessions = await db.select({
        id: patientSessions.id,
        patientId: patientSessions.patientId,
        date: patientSessions.date,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        evaScore: patientSessions.evaScore,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        patient: {
          id: patients.id,
          fullName: patients.fullName,
        },
      }).from(patientSessions)
        .leftJoin(patients, eq(patientSessions.patientId, patients.id))
        .where(eq(patientSessions.patientId, patientId))
        .orderBy(desc(patientSessions.createdAt));
    } else {
      allSessions = await db.select({
        id: patientSessions.id,
        patientId: patientSessions.patientId,
        date: patientSessions.date,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        evaScore: patientSessions.evaScore,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        patient: {
          id: patients.id,
          fullName: patients.fullName,
        },
      }).from(patientSessions)
        .leftJoin(patients, eq(patientSessions.patientId, patients.id))
        .orderBy(desc(patientSessions.createdAt));
    }

    return NextResponse.json(allSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new patient session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.date) {
      return NextResponse.json(
        { error: 'patientId and date are required' },
        { status: 400 }
      );
    }

    const newSession = await db.insert(patientSessions).values({
      id: body.id || Date.now().toString(),
      patientId: body.patientId,
      date: body.date,
      subjective: body.subjective || null,
      objective: body.objective || null,
      assessment: body.assessment || null,
      plan: body.plan || null,
      evaScore: body.evaScore || null,
    }).returning();

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
