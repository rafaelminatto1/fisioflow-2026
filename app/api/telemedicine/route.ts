import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSessions, patients } from '@/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';

// GET /api/telemedicine - List telemedicine sessions (redirects to /sessions logic)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    let whereClause = undefined;
    if (dateParam) {
      const date = new Date(dateParam);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      whereClause = and(
        gte(telemedicineSessions.scheduledFor, startOfDay),
        gte(endOfDay, telemedicineSessions.scheduledFor)
      );
    }

    const sessions = await db.query.telemedicineSessions.findMany({
      where: whereClause,
      orderBy: [desc(telemedicineSessions.scheduledFor)],
      with: {
        patient: true,
        therapist: true,
      },
    });

    // Map to expected format by frontend
    const result = sessions.map(session => ({
      id: session.id,
      patientId: session.patientId,
      patientName: session.patient?.fullName || 'Paciente',
      patientPhoto: undefined,
      scheduledTime: session.scheduledFor?.toISOString() || new Date().toISOString(),
      status: session.status || 'scheduled',
      type: 'follow_up', // default type since schema doesn't have type field
      notes: session.notes,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching telemedicine sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch telemedicine sessions' },
      { status: 500 }
    );
  }
}

// POST /api/telemedicine - Create telemedicine session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const newSession = await db.insert(telemedicineSessions).values({
      patientId: body.patientId,
      therapistId: body.therapistId || null,
      scheduledFor: body.scheduledTime ? new Date(body.scheduledTime) : new Date(),
      status: body.status || 'scheduled',
      duration: body.duration || 30,
      notes: body.notes || null,
    }).returning();

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('Error creating telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to create telemedicine session' },
      { status: 500 }
    );
  }
}
