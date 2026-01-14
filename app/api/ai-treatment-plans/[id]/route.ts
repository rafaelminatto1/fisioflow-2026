import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiTreatmentPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/ai-treatment-plans/[id] - Get a specific AI treatment plan
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const plan = await db.query.aiTreatmentPlans.findFirst({
      where: eq(aiTreatmentPlans.id, id),
      with: {
        patient: true,
        createdByStaff: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'AI treatment plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching AI treatment plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI treatment plan' },
      { status: 500 }
    );
  }
}

// PUT /api/ai-treatment-plans/[id] - Update an AI treatment plan
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(aiTreatmentPlans)
      .set({
        diagnosis: body.diagnosis,
        objectives: body.objectives,
        techniques: body.techniques,
        exercises: body.exercises,
        expectedOutcomes: body.expectedOutcomes,
        precautions: body.precautions,
        modifications: body.modifications,
        isAccepted: body.isAccepted,
      })
      .where(eq(aiTreatmentPlans.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'AI treatment plan not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('ai-treatment-plans:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating AI treatment plan:', error);
    return NextResponse.json(
      { error: 'Failed to update AI treatment plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/ai-treatment-plans/[id] - Delete an AI treatment plan
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(aiTreatmentPlans)
      .where(eq(aiTreatmentPlans.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'AI treatment plan not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('ai-treatment-plans:*');

    return NextResponse.json({ success: true, message: 'AI treatment plan deleted' });
  } catch (error) {
    console.error('Error deleting AI treatment plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI treatment plan' },
      { status: 500 }
    );
  }
}
