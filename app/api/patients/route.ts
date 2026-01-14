import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { withCache, invalidatePattern, CacheKeys } from '@/lib/vercel-kv';

// GET /api/patients - List all patients (cached)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const sortBy = searchParams.get('sort'); // 'points', 'name', 'date'

    // Cache key based on parameters
    const cacheKey = `patients:${activeOnly ? 'active' : 'all'}:${sortBy || 'date'}`;

    const allPatients = await withCache(
      cacheKey,
      async () => {
        // Determine sort order
        let orderBy;
        switch (sortBy) {
          case 'points':
            orderBy = [desc(patients.totalPoints)];
            break;
          case 'name':
            orderBy = [asc(patients.fullName)];
            break;
          default:
            orderBy = [desc(patients.createdAt)];
        }

        try {
          // Try with tags relation first
          const result = await db.query.patients.findMany({
            orderBy,
            where: activeOnly ? eq(patients.isActive, true) : undefined,
            with: {
              tags: {
                with: {
                  tag: true
                }
              }
            }
          });

          // Map tags structure to string array to match API contract
          return result.map(p => ({
            ...p,
            tags: p.tags?.map((pt: any) => pt.tag?.name).filter(Boolean) || []
          }));
        } catch (tagError) {
          // Fallback: query without tags if relation fails
          console.warn('Tags relation failed, querying without tags:', tagError);
          const result = await db.query.patients.findMany({
            orderBy,
            where: activeOnly ? eq(patients.isActive, true) : undefined,
          });

          return result.map(p => ({
            ...p,
            tags: []
          }));
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
      cpf: body.cpf || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      profession: body.profession || null,
      condition: body.condition || null,
      address: body.address || null,
      emergencyContact: body.emergencyContact || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      totalPoints: body.totalPoints || 0,
      level: body.level || 1,
      currentStreak: body.currentStreak || 0,
      lastActiveDate: body.lastActiveDate ? new Date(body.lastActiveDate) : null,
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
