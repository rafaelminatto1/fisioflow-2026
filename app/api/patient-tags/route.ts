import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientTags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/patient-tags - Add tag to patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.tagId) {
      return NextResponse.json(
        { error: 'patientId and tagId are required' },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await db.select().from(patientTags).where(
      eq(patientTags.patientId, body.patientId)
    );

    const alreadyLinked = existing.some(pt => pt.tagId === body.tagId);

    if (alreadyLinked) {
      return NextResponse.json(
        { error: 'Tag already assigned to patient' },
        { status: 400 }
      );
    }

    const newLink = await db.insert(patientTags).values({
      patientId: body.patientId,
      tagId: body.tagId,
    }).returning();

    return NextResponse.json(newLink[0], { status: 201 });
  } catch (error) {
    console.error('Error adding tag to patient:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient-tags - Remove tag from patient
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const tagId = searchParams.get('tagId');

    if (!patientId || !tagId) {
      return NextResponse.json(
        { error: 'patientId and tagId are required' },
        { status: 400 }
      );
    }

    await db.delete(patientTags).where(
      and(
        eq(patientTags.patientId, patientId),
        eq(patientTags.tagId, tagId)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing tag from patient:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from patient' },
      { status: 500 }
    );
  }
}
