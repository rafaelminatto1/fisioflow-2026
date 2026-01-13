import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { referrals } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/referrals/[id] - Get a specific referral
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const referral = await db.select().from(referrals).where(eq(referrals.id, id)).limit(1);

    if (!referral[0]) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    return NextResponse.json(referral[0]);
  } catch (error) {
    console.error('Error fetching referral:', error);
    return NextResponse.json({ error: 'Failed to fetch referral' }, { status: 500 });
  }
}

// PUT /api/referrals/[id] - Update a referral
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(referrals)
      .set({
        status: body.status,
        appointmentDate: body.appointmentDate,
        reportReceived: body.reportReceived,
        reportUrl: body.reportUrl,
        notes: body.notes,
        referredTo: body.referredTo,
        updatedAt: new Date(),
      })
      .where(eq(referrals.id, id))
      .returning();

    if (!updated[0]) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}

// DELETE /api/referrals/[id] - Delete a referral
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(referrals).where(eq(referrals.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting referral:', error);
    return NextResponse.json({ error: 'Failed to delete referral' }, { status: 500 });
  }
}
