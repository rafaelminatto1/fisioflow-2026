import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/patients - List all patients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let allPatients;

    if (activeOnly) {
      allPatients = await db.select().from(patients).where(eq(patients.isActive, true)).orderBy(desc(patients.createdAt));
    } else {
      allPatients = await db.select().from(patients).orderBy(desc(patients.createdAt));
    }

    return NextResponse.json(allPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.fullName) {
      return NextResponse.json(
        { error: 'fullName is required' },
        { status: 400 }
      );
    }

    const newPatient = await db.insert(patients).values({
      fullName: body.fullName,
      email: body.email || null,
      phone: body.phone || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      totalPoints: body.totalPoints || 0,
      level: body.level || 1,
      currentStreak: body.currentStreak || 0,
      lastActiveDate: body.lastActiveDate || null,
    }).returning();

    return NextResponse.json(newPatient[0], { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
