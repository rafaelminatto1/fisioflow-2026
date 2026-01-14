import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientInsurance } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/patient-insurance/[id] - Get a specific patient insurance record
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const record = await db.query.patientInsurance.findFirst({
      where: eq(patientInsurance.id, id),
      with: {
        plan: true,
        patient: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Patient insurance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching patient insurance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient insurance record' },
      { status: 500 }
    );
  }
}

// PUT /api/patient-insurance/[id] - Update a patient insurance record
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get the current record to know the patientId
    const currentRecord = await db.query.patientInsurance.findFirst({
      where: eq(patientInsurance.id, id),
    });

    if (!currentRecord) {
      return NextResponse.json(
        { error: 'Patient insurance record not found' },
        { status: 404 }
      );
    }

    // If this is marked as primary, update other records to non-primary
    if (body.isPrimary) {
      await db.update(patientInsurance)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(patientInsurance.patientId, currentRecord.patientId),
            eq(patientInsurance.isPrimary, true)
          )
        );
    }

    const updated = await db.update(patientInsurance)
      .set({
        planId: body.planId,
        cardNumber: body.cardNumber,
        holderName: body.holderName,
        holderCpf: body.holderCpf,
        validityStart: body.validityStart ? new Date(body.validityStart) : undefined,
        validityEnd: body.validityEnd ? new Date(body.validityEnd) : undefined,
        authorizationCode: body.authorizationCode,
        isPrimary: body.isPrimary,
        updatedAt: new Date(),
      })
      .where(eq(patientInsurance.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Patient insurance record not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern(`patient-insurance:${currentRecord.patientId}`);

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating patient insurance:', error);
    return NextResponse.json(
      { error: 'Failed to update patient insurance record' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient-insurance/[id] - Delete a patient insurance record
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get the current record to know the patientId for cache invalidation
    const currentRecord = await db.query.patientInsurance.findFirst({
      where: eq(patientInsurance.id, id),
    });

    const deleted = await db.delete(patientInsurance)
      .where(eq(patientInsurance.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Patient insurance record not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    if (currentRecord) {
      await invalidatePattern(`patient-insurance:${currentRecord.patientId}`);
    }

    return NextResponse.json({ success: true, message: 'Patient insurance record deleted' });
  } catch (error) {
    console.error('Error deleting patient insurance:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient insurance record' },
      { status: 500 }
    );
  }
}
