import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, tags, patientTags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern, CacheKeys } from '@/lib/vercel-kv';

// GET /api/patients/[id] - Get a single patient (cached)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const patient = await withCache(
      CacheKeys.PATIENT(id),
      async () => {
        return await db.select().from(patients).where(eq(patients.id, id));
      },
      { ttl: 300 } // 5 minutes cache
    );

    if (!patient || patient.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Fetch tags for this patient
    const patientTagsData = await db.select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    }).from(tags)
      .innerJoin(patientTags, eq(patientTags.tagId, tags.id))
      .where(eq(patientTags.patientId, id));

    return NextResponse.json({
      ...patient[0],
      tags: patientTagsData,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Update a patient (invalidates cache)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(patients)
      .set({
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        cpf: body.cpf,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        profession: body.profession,
        condition: body.condition,
        address: body.address,
        emergencyContact: body.emergencyContact,
        isActive: body.isActive,
        totalPoints: body.totalPoints,
        level: body.level,
        currentStreak: body.currentStreak,
        lastActiveDate: body.lastActiveDate ? new Date(body.lastActiveDate) : undefined,
      })
      .where(eq(patients.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('patients:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Delete a patient (invalidates cache)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.update(patients)
      .set({ isActive: false })
      .where(eq(patients.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('patients:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
