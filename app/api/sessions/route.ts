import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientSessions, patients, exercises } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

// GET /api/sessions - List patient sessions with optional patient filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const includeExercises = searchParams.get('includeExercises') === 'true';
    const limitNum = searchParams.get('limit');
    const offsetNum = searchParams.get('offset');

    const baseQuery = db.select({
      id: patientSessions.id,
      patientId: patientSessions.patientId,
      date: patientSessions.date,
      subjective: patientSessions.subjective,
      objective: patientSessions.objective,
      assessment: patientSessions.assessment,
      plan: patientSessions.plan,
      evaScore: patientSessions.evaScore,
      painMap: patientSessions.painMap,
      homeCareExercises: patientSessions.homeCareExercises,
      sessionType: patientSessions.sessionType,
      duration: patientSessions.duration,
      attachments: patientSessions.attachments,
      therapistNotes: patientSessions.therapistNotes,
      createdAt: patientSessions.createdAt,
      updatedAt: patientSessions.updatedAt,
      patient: {
        id: patients.id,
        fullName: patients.fullName,
      },
    }).from(patientSessions)
      .leftJoin(patients, eq(patientSessions.patientId, patients.id))
      .orderBy(desc(patientSessions.createdAt));

    // Apply filter by patientId if provided
    const filteredQuery = patientId
      ? baseQuery.where(eq(patientSessions.patientId, patientId))
      : baseQuery;

    // Apply limit and offset
    const limitedQuery = limitNum
      ? filteredQuery.limit(parseInt(limitNum))
      : filteredQuery;
    const finalQuery = offsetNum
      ? limitedQuery.offset(parseInt(offsetNum))
      : limitedQuery;

    const allSessions = await finalQuery;

    // If includeExercises is true, fetch exercise details for homeCareExercises
    if (includeExercises && allSessions.length > 0) {
      // Collect all unique exercise IDs from all sessions
      const allExerciseIds = new Set<string>();
      allSessions.forEach((session: any) => {
        if (session.homeCareExercises && Array.isArray(session.homeCareExercises)) {
          session.homeCareExercises.forEach((id: string) => allExerciseIds.add(id));
        }
      });

      // Fetch all exercises in a single query using inArray
      let exercisesMap = new Map<string, any>();
      if (allExerciseIds.size > 0) {
        const exercisesData = await db.select({
          id: exercises.id,
          title: exercises.title,
          description: exercises.description,
          category: exercises.category,
          videoUrl: exercises.videoUrl,
        }).from(exercises).where(inArray(exercises.id, Array.from(allExerciseIds)));

        // Create a map for easy lookup
        exercisesMap = new Map(exercisesData.map(ex => [ex.id, ex]));
      }

      // Attach exercise details to sessions
      const sessionsWithExercises = allSessions.map((session: any) => ({
        ...session,
        homeCareExercisesData: session.homeCareExercises?.map((id: string) => exercisesMap.get(id)).filter(Boolean) || [],
      }));

      return NextResponse.json(sessionsWithExercises);
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
      painMap: body.painMap || null,
      homeCareExercises: body.homeCareExercises || null,
      sessionType: body.sessionType || 'presencial',
      duration: body.duration || null,
      attachments: body.attachments || null,
      therapistNotes: body.therapistNotes || null,
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
