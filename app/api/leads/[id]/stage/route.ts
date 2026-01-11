import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/leads/[id]/stage - Move lead to a different stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    const updated = await db.update(leads)
      .set({
        status: body.status, // 'new', 'contacted', 'qualified', 'converted', 'lost'
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error moving lead stage:', error);
    return NextResponse.json(
      { error: 'Failed to move lead to new stage' },
      { status: 500 }
    );
  }
}
