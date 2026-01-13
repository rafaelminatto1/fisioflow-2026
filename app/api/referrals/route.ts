import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { referrals, patients } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/referrals - List all referrals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');

    const conditions = [];

    if (patientId) {
      conditions.push(eq(referrals.patientId, patientId));
    }
    if (status) {
      conditions.push(eq(referrals.status, status as any));
    }
    if (urgency) {
      conditions.push(eq(referrals.urgency, urgency as any));
    }

    const referralsList = await db.select({
      id: referrals.id,
      patientId: referrals.patientId,
      providerName: referrals.providerName,
      specialty: referrals.specialty,
      reason: referrals.reason,
      urgency: referrals.urgency,
      status: referrals.status,
      referredTo: referrals.referredTo,
      appointmentDate: referrals.appointmentDate,
      reportReceived: referrals.reportReceived,
      reportUrl: referrals.reportUrl,
      notes: referrals.notes,
      referredBy: referrals.referredBy,
      createdAt: referrals.createdAt,
      updatedAt: referrals.updatedAt,
      patientName: patients.fullName,
    })
      .from(referrals)
      .leftJoin(patients, eq(referrals.patientId, patients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(referrals.createdAt));

    return NextResponse.json(referralsList);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

// POST /api/referrals - Create a new referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.patientId || !body.providerName || !body.specialty || !body.reason) {
      return NextResponse.json(
        { error: 'patientId, providerName, specialty, and reason are required' },
        { status: 400 }
      );
    }

    const newReferral = await db.insert(referrals).values({
      id: nanoid(),
      patientId: body.patientId,
      providerName: body.providerName,
      specialty: body.specialty,
      reason: body.reason,
      urgency: body.urgency || 'routine',
      referredTo: body.referredTo || null,
      appointmentDate: body.appointmentDate || null,
      notes: body.notes || null,
      referredBy: body.referredBy || null,
    }).returning();

    return NextResponse.json(newReferral[0], { status: 201 });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
