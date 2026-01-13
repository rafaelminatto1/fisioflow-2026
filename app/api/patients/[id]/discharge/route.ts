import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientDischarges, patients, patientSessions } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/patients/[id]/discharge - Get patient discharge info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discharge = await db.select().from(patientDischarges)
      .where(eq(patientDischarges.patientId, id))
      .orderBy(desc(patientDischarges.dischargeDate))
      .limit(1);

    if (!discharge[0]) {
      return NextResponse.json(null);
    }

    return NextResponse.json(discharge[0]);
  } catch (error) {
    console.error('Error fetching discharge info:', error);
    return NextResponse.json({ error: 'Failed to fetch discharge info' }, { status: 500 });
  }
}

// POST /api/patients/[id]/discharge - Create a new discharge record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.dischargeDate || !body.reason || !body.treatmentSummary) {
      return NextResponse.json(
        { error: 'dischargeDate, reason, and treatmentSummary are required' },
        { status: 400 }
      );
    }

    // Count sessions for this patient
    const sessionCount = await db.select().from(patientSessions)
      .where(eq(patientSessions.patientId, id));

    const newDischarge = await db.insert(patientDischarges).values({
      id: nanoid(),
      patientId: id,
      dischargeDate: new Date(body.dischargeDate),
      reason: body.reason,
      primaryDiagnosis: body.primaryDiagnosis || null,
      secondaryDiagnoses: body.secondaryDiagnoses || null,
      treatmentSummary: body.treatmentSummary,
      initialAssessment: body.initialAssessment || null,
      finalAssessment: body.finalAssessment || null,
      outcomes: body.outcomes || null,
      painLevelInitial: body.painLevelInitial || null,
      painLevelFinal: body.painLevelFinal || null,
      functionalGain: body.functionalGain || null,
      sessionCount: sessionCount.length,
      recommendations: body.recommendations || null,
      followUpDate: body.followUpDate || null,
      homeCareInstructions: body.homeCareInstructions || null,
      attachments: body.attachments || null,
      dischargedBy: body.dischargedBy || null,
      approvedBy: body.approvedBy || null,
    }).returning();

    // Mark patient as inactive if discharge is complete
    if (body.markPatientInactive) {
      await db.update(patients)
        .set({ isActive: false })
        .where(eq(patients.id, id));
    }

    return NextResponse.json(newDischarge[0], { status: 201 });
  } catch (error) {
    console.error('Error creating discharge:', error);
    return NextResponse.json({ error: 'Failed to create discharge' }, { status: 500 });
  }
}

// PUT /api/patients/[id]/discharge - Update discharge record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(patientDischarges)
      .set({
        treatmentSummary: body.treatmentSummary,
        finalAssessment: body.finalAssessment,
        outcomes: body.outcomes,
        recommendations: body.recommendations,
        followUpDate: body.followUpDate,
        homeCareInstructions: body.homeCareInstructions,
        approvedBy: body.approvedBy,
      })
      .where(and(
        eq(patientDischarges.patientId, id),
        eq(patientDischarges.id, body.dischargeId)
      ))
      .returning();

    if (!updated[0]) {
      return NextResponse.json({ error: 'Discharge record not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating discharge:', error);
    return NextResponse.json({ error: 'Failed to update discharge' }, { status: 500 });
  }
}
