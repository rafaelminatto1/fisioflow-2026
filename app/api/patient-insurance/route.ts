import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientInsurance, insurancePlans, patients } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/patient-insurance - List patient insurance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const cacheKey = `patient-insurance:${patientId}`;

    const records = await withCache(
      cacheKey,
      async () => {
        return await db.query.patientInsurance.findMany({
          where: eq(patientInsurance.patientId, patientId),
          with: {
            plan: true,
          },
          orderBy: [desc(patientInsurance.isPrimary), desc(patientInsurance.createdAt)],
        });
      },
      { ttl: 180 }
    );

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching patient insurance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient insurance records' },
      { status: 500 }
    );
  }
}

// POST /api/patient-insurance - Create a patient insurance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.planId) {
      return NextResponse.json(
        { error: 'patientId and planId are required' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, body.patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if plan exists
    const plan = await db.query.insurancePlans.findFirst({
      where: eq(insurancePlans.id, body.planId),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Insurance plan not found' },
        { status: 404 }
      );
    }

    // If this is marked as primary, update other records to non-primary
    if (body.isPrimary) {
      await db.update(patientInsurance)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(patientInsurance.patientId, body.patientId),
            eq(patientInsurance.isPrimary, true)
          )
        );
    }

    const newRecord = await db.insert(patientInsurance).values({
      patientId: body.patientId,
      planId: body.planId,
      cardNumber: body.cardNumber || null,
      holderName: body.holderName || null,
      holderCpf: body.holderCpf || null,
      validityStart: body.validityStart ? new Date(body.validityStart) : null,
      validityEnd: body.validityEnd ? new Date(body.validityEnd) : null,
      authorizationCode: body.authorizationCode || null,
      isPrimary: body.isPrimary !== undefined ? body.isPrimary : true,
    }).returning();

    // Invalidate cache
    await invalidatePattern(`patient-insurance:${body.patientId}`);

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('Error creating patient insurance:', error);
    return NextResponse.json(
      { error: 'Failed to create patient insurance record' },
      { status: 500 }
    );
  }
}
