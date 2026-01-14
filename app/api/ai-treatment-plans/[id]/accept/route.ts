import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiTreatmentPlans, prescriptions, exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/ai-treatment-plans/[id]/accept - Accept an AI treatment plan and create prescriptions
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get the plan
    const plan = await db.query.aiTreatmentPlans.findFirst({
      where: eq(aiTreatmentPlans.id, id),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'AI treatment plan not found' },
        { status: 404 }
      );
    }

    if (plan.isAccepted) {
      return NextResponse.json(
        { error: 'This plan has already been accepted' },
        { status: 400 }
      );
    }

    // Update the plan as accepted
    const updated = await db.update(aiTreatmentPlans)
      .set({
        isAccepted: true,
        modifications: body.modifications || null,
      })
      .where(eq(aiTreatmentPlans.id, id))
      .returning();

    // If the plan has exercises, create prescriptions for each
    const planExercises = plan.exercises as Array<{
      exerciseId?: string;
      name: string;
      sets: number;
      reps: string;
      frequency: string;
      notes?: string;
    }> || [];

    const createdPrescriptions = [];

    for (const planExercise of planExercises) {
      let exerciseId = planExercise.exerciseId;

      // If no exerciseId, try to find or create the exercise
      if (!exerciseId) {
        // Try to find existing exercise by name
        const existingExercise = await db.query.exercises.findFirst({
          where: eq(exercises.title, planExercise.name),
        });

        if (existingExercise) {
          exerciseId = existingExercise.id;
        } else {
          // Create new exercise
          const newExercise = await db.insert(exercises).values({
            title: planExercise.name,
            description: planExercise.notes || null,
            category: 'AI Generated',
          }).returning();
          exerciseId = newExercise[0].id;
        }
      }

      // Create prescription
      const prescription = await db.insert(prescriptions).values({
        patientId: plan.patientId,
        exerciseId: exerciseId,
        frequency: planExercise.frequency || 'daily',
        active: true,
        notes: `${planExercise.sets} séries x ${planExercise.reps}. ${planExercise.notes || ''}`,
      }).returning();

      createdPrescriptions.push(prescription[0]);
    }

    // Invalidate caches
    await invalidatePattern('ai-treatment-plans:*');
    await invalidatePattern(`prescriptions:*`);

    return NextResponse.json({
      success: true,
      message: 'Treatment plan accepted and prescriptions created',
      plan: updated[0],
      prescriptionsCreated: createdPrescriptions.length,
    });
  } catch (error) {
    console.error('Error accepting AI treatment plan:', error);
    return NextResponse.json(
      { error: 'Failed to accept AI treatment plan' },
      { status: 500 }
    );
  }
}
