import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { or, ilike, and, eq } from 'drizzle-orm';

// GET /api/search/leads - Search leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Build search conditions
    const searchConditions = [
      ilike(leads.name, `%${query}%`),
      ilike(leads.email, `%${query}%`),
      ilike(leads.phone, `%${query}%`),
      ilike(leads.notes, `%${query}%`),
    ];

    let whereClause: any = or(...searchConditions);

    if (status) {
      whereClause = and(whereClause, eq(leads.status, status));
    }

    const results = await db.query.leads.findMany({
      where: whereClause,
      orderBy: [leads.createdAt],
      limit,
    });

    return NextResponse.json({
      query,
      status,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error searching leads:', error);
    return NextResponse.json(
      { error: 'Failed to search leads' },
      { status: 500 }
    );
  }
}
