import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, patients, staff } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/appointments/[id] - Update an appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(appointments)
      .set({
        patientId: body.patientId,
        therapistId: body.therapistId,
        type: body.type,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        status: body.status,
        notes: body.notes,
        reminderSent: body.reminderSent,
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Fetch with patient and therapist names
    const result = await db.select({
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
      .where(eq(appointments.id, id));

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Delete an appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(appointments).where(eq(appointments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
