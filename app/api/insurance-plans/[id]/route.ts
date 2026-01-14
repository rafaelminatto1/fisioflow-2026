import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insurancePlans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/insurance-plans/[id] - Get a specific insurance plan
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const plan = await db.query.insurancePlans.findFirst({
      where: eq(insurancePlans.id, id),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Insurance plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance plan' },
      { status: 500 }
    );
  }
}

// PUT /api/insurance-plans/[id] - Update an insurance plan
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(insurancePlans)
      .set({
        name: body.name,
        ansCode: body.ansCode,
        cnpj: body.cnpj,
        phone: body.phone,
        email: body.email,
        address: body.address,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(insurancePlans.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Insurance plan not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('insurance-plans:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to update insurance plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/insurance-plans/[id] - Delete an insurance plan
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(insurancePlans)
      .where(eq(insurancePlans.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Insurance plan not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('insurance-plans:*');

    return NextResponse.json({ success: true, message: 'Insurance plan deleted' });
  } catch (error) {
    console.error('Error deleting insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete insurance plan' },
      { status: 500 }
    );
  }
}
