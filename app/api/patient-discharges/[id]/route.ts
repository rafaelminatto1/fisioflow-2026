import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientDischarges } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/patient-discharges/[id] - Get a specific patient discharge
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const discharge = await db.query.patientDischarges.findFirst({
      where: eq(patientDischarges.id, id),
      with: {
        patient: true,
        dischargedByStaff: true,
        approvedByStaff: true,
      },
    });

    if (!discharge) {
      return NextResponse.json(
        { error: 'Patient discharge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(discharge);
  } catch (error) {
    console.error('Error fetching patient discharge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient discharge' },
      { status: 500 }
    );
  }
}

// PUT /api/patient-discharges/[id] - Update a patient discharge
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(patientDischarges)
      .set({
        dischargeDate: body.dischargeDate ? new Date(body.dischargeDate) : undefined,
        reason: body.reason,
        primaryDiagnosis: body.primaryDiagnosis,
        secondaryDiagnoses: body.secondaryDiagnoses,
        treatmentSummary: body.treatmentSummary,
        initialAssessment: body.initialAssessment,
        finalAssessment: body.finalAssessment,
        outcomes: body.outcomes,
        painLevelInitial: body.painLevelInitial,
        painLevelFinal: body.painLevelFinal,
        functionalGain: body.functionalGain,
        recommendations: body.recommendations,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
        homeCareInstructions: body.homeCareInstructions,
        attachments: body.attachments,
        approvedBy: body.approvedBy,
      })
      .where(eq(patientDischarges.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Patient discharge not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('patient-discharges:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating patient discharge:', error);
    return NextResponse.json(
      { error: 'Failed to update patient discharge' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient-discharges/[id] - Delete a patient discharge (reactivate patient)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get the discharge first to know the patient
    const discharge = await db.query.patientDischarges.findFirst({
      where: eq(patientDischarges.id, id),
    });

    if (!discharge) {
      return NextResponse.json(
        { error: 'Patient discharge not found' },
        { status: 404 }
      );
    }

    // Delete the discharge
    await db.delete(patientDischarges)
      .where(eq(patientDischarges.id, id));

    // Note: We don't automatically reactivate the patient here
    // That should be a separate deliberate action

    // Invalidate cache
    await invalidatePattern('patient-discharges:*');

    return NextResponse.json({ 
      success: true, 
      message: 'Patient discharge deleted. Note: Patient status was not changed automatically.',
      patientId: discharge.patientId,
    });
  } catch (error) {
    console.error('Error deleting patient discharge:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient discharge' },
      { status: 500 }
    );
  }
}
