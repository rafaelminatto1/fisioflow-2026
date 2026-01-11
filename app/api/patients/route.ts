import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { withCache, invalidatePattern, CacheKeys } from '@/lib/vercel-kv';

// GET /api/patients - List all patients (cached)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    // Cache for 5 minutes (300 seconds)
    const cacheKey = activeOnly ? 'patients:active' : CacheKeys.PATIENTS;

    const allPatients = await withCache(
      cacheKey,
      async () => {
        if (activeOnly) {
          return await db.select().from(patients).where(eq(patients.isActive, true)).orderBy(desc(patients.createdAt));
        } else {
          return await db.select().from(patients).orderBy(desc(patients.createdAt));
        }
      },
      { ttl: 300 } // 5 minutes cache
    );

    return NextResponse.json(allPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient (invalidates cache)
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

    // Invalidate cache
    await invalidatePattern('patients:*');

    return NextResponse.json(newPatient[0], { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
