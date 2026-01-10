import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients } from '@/db/schema';
import { eq, gte, lte, and, asc } from 'drizzle-orm';

// GET /api/appointments - List appointments with optional date filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const future = searchParams.get('future') === 'true';
    const sort = searchParams.get('sort');

    const conditions = [];

    if (startDate) {
      conditions.push(gte(appointments.startTime, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(appointments.startTime, new Date(endDate)));
    }
    if (future) {
      conditions.push(gte(appointments.startTime, new Date()));
    }

    let query = db.select({
      id: appointments.id,
      patientId: appointments.patientId,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      patientName: patients.fullName,
    }).from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Default to ascending order for future appointments (Next Appointments)
    if (sort === 'asc' || future) {
      query = query.orderBy(asc(appointments.startTime));
    }

    if (limit) {
      query = query.limit(limit);
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'patientId, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const newAppointment = await db.insert(appointments).values({
      patientId: body.patientId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      status: body.status || 'scheduled',
    }).returning();

    return NextResponse.json(newAppointment[0], { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
