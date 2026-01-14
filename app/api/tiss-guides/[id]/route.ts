import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tissGuides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/tiss-guides/[id] - Get a specific TISS guide
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const guide = await db.query.tissGuides.findFirst({
      where: eq(tissGuides.id, id),
      with: {
        patient: true,
        insurancePlan: true,
        createdByStaff: true,
      },
    });

    if (!guide) {
      return NextResponse.json(
        { error: 'TISS guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching TISS guide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TISS guide' },
      { status: 500 }
    );
  }
}

// PUT /api/tiss-guides/[id] - Update a TISS guide
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Calculate total amount if procedures are updated
    let totalAmount = body.totalAmount;
    if (body.procedures && Array.isArray(body.procedures)) {
      totalAmount = body.procedures.reduce((sum: number, proc: any) => {
        return sum + (proc.totalValue || proc.quantity * proc.unitValue || 0);
      }, 0);
      totalAmount = Math.round(totalAmount * 100); // Convert to cents
    }

    const updated = await db.update(tissGuides)
      .set({
        insurancePlanId: body.insurancePlanId,
        authorizationNumber: body.authorizationNumber,
        sessionId: body.sessionId,
        procedures: body.procedures,
        totalAmount: totalAmount,
        status: body.status,
        submissionDate: body.submissionDate ? new Date(body.submissionDate) : undefined,
        responseDate: body.responseDate ? new Date(body.responseDate) : undefined,
        glosaReason: body.glosaReason,
        glosaAmount: body.glosaAmount,
        updatedAt: new Date(),
      })
      .where(eq(tissGuides.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'TISS guide not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('tiss-guides:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating TISS guide:', error);
    return NextResponse.json(
      { error: 'Failed to update TISS guide' },
      { status: 500 }
    );
  }
}

// DELETE /api/tiss-guides/[id] - Delete a TISS guide
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(tissGuides)
      .where(eq(tissGuides.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'TISS guide not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('tiss-guides:*');

    return NextResponse.json({ success: true, message: 'TISS guide deleted' });
  } catch (error) {
    console.error('Error deleting TISS guide:', error);
    return NextResponse.json(
      { error: 'Failed to delete TISS guide' },
      { status: 500 }
    );
  }
}
