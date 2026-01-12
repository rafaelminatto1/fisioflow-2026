import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSessions } from '@/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/telemedicine/sessions - List telemedicine sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const therapistId = searchParams.get('therapistId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    const cacheKey = `telemedicine-sessions:${patientId || 'all'}:${status || 'all'}`;

    const sessions = await withCache(
      cacheKey,
      async () => {
        let whereClause: any = undefined;

        if (patientId) {
          whereClause = eq(telemedicineSessions.patientId, patientId);
        } else if (therapistId) {
          whereClause = eq(telemedicineSessions.therapistId, therapistId);
        } else if (status) {
          whereClause = eq(telemedicineSessions.status, status);
        } else if (upcoming) {
          const now = new Date();
          whereClause = and(
            eq(telemedicineSessions.status, 'scheduled'),
            gte(telemedicineSessions.scheduledFor, now)
          );
        }

        return await db.query.telemedicineSessions.findMany({
          where: whereClause,
          with: {
            patient: true,
            therapist: true,
          },
          orderBy: [desc(telemedicineSessions.scheduledFor)],
        });
      },
      { ttl: 180 }
    );

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching telemedicine sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch telemedicine sessions' },
      { status: 500 }
    );
  }
}

// POST /api/telemedicine/sessions - Schedule a new telemedicine session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.scheduledFor) {
      return NextResponse.json(
        { error: 'patientId and scheduledFor are required' },
        { status: 400 }
      );
    }

    const newSession = await db.insert(telemedicineSessions).values({
      patientId: body.patientId,
      therapistId: body.therapistId || null,
      scheduledFor: new Date(body.scheduledFor),
      duration: body.duration || 30,
      status: body.status || 'scheduled',
      roomUrl: body.roomUrl || null,
      roomPassword: body.roomPassword || null,
      notes: body.notes || null,
    }).returning();

    // Invalidate cache
    await invalidatePattern('telemedicine-sessions:*');
    await invalidatePattern(`patient:${body.patientId}:*`);

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('Error creating telemedicine session:', error);
    return NextResponse.json(
      { error: 'Failed to create telemedicine session' },
      { status: 500 }
    );
  }
}
