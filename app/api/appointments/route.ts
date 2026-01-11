import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients, staff } from '@/db/schema';
import { eq, gte, lte, and } from 'drizzle-orm';

// GET /api/appointments - List appointments with optional date filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let allAppointments;

    if (startDate && endDate) {
      allAppointments = await db.select({
        id: appointments.id,
        patientId: appointments.patientId,
        therapistId: appointments.therapistId,
        type: appointments.type,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        notes: appointments.notes,
        reminderSent: appointments.reminderSent,
        patientName: patients.fullName,
        therapistName: staff.name,
      }).from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .leftJoin(staff, eq(appointments.therapistId, staff.id))
        .where(
          and(
            gte(appointments.startTime, new Date(startDate)),
            lte(appointments.startTime, new Date(endDate))
          )
        );
    } else {
      allAppointments = await db.select({
        id: appointments.id,
        patientId: appointments.patientId,
        therapistId: appointments.therapistId,
        type: appointments.type,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        notes: appointments.notes,
        reminderSent: appointments.reminderSent,
        patientName: patients.fullName,
        therapistName: staff.name,
      }).from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .leftJoin(staff, eq(appointments.therapistId, staff.id));
    }

    return NextResponse.json(allAppointments);
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
      therapistId: body.therapistId || null,
      type: body.type || 'consultation',
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      status: body.status || 'scheduled',
      notes: body.notes || null,
      reminderSent: false,
    }).returning();

    const createdId = newAppointment[0].id;

    // Fetch full details including names
    const hydratedAppointment = await db.select({
      id: appointments.id,
      patientId: appointments.patientId,
      therapistId: appointments.therapistId,
      type: appointments.type,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      notes: appointments.notes,
      reminderSent: appointments.reminderSent,
      patientName: patients.fullName,
      therapistName: staff.name,
    }).from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staff, eq(appointments.therapistId, staff.id))
      .where(eq(appointments.id, createdId));

    return NextResponse.json(hydratedAppointment[0], { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
