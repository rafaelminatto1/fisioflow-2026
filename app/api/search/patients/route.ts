import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/db/schema';
import { sql, or, ilike, and, eq } from 'drizzle-orm';

// GET /api/search/patients - Search patients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const activeOnly = searchParams.get('active') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build search conditions
    const searchConditions = [
      ilike(patients.fullName, `%${query}%`),
      ilike(patients.email, `%${query}%`),
      ilike(patients.phone, `%${query}%`),
      ilike(patients.cpf, `%${query}%`),
    ];

    const whereClause = activeOnly
      ? and(eq(patients.isActive, true), or(...searchConditions))
      : or(...searchConditions);

    const results = await db.query.patients.findMany({
      where: whereClause,
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
      },
      limit,
    });

    // Format results
    const formatted = results.map((p) => ({
      ...p,
      tags: p.tags.map((pt: any) => pt.tag),
    }));

    return NextResponse.json({
      query,
      count: formatted.length,
      results: formatted,
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    return NextResponse.json(
      { error: 'Failed to search patients' },
      { status: 500 }
    );
  }
}
