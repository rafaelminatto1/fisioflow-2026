import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/waitlist/[id] - Get a specific waitlist entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await db.select().from(waitlist).where(eq(waitlist.id, id));

    if (!entry || entry.length === 0) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry[0]);
  } catch (error) {
    console.error('Error fetching waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entry' },
      { status: 500 }
    );
  }
}

// PUT /api/waitlist/[id] - Update a waitlist entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(waitlist)
      .set({
        patientName: body.patientName,
        phone: body.phone,
        preferredDate: body.preferredDate,
        preferredTime: body.preferredTime,
        notes: body.notes,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(waitlist.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/waitlist/[id] - Delete a waitlist entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db.delete(waitlist)
      .where(eq(waitlist.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Waitlist entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}
