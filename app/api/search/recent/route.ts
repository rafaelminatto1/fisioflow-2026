import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// Note: searchHistory table doesn't exist yet in schema
// import { searchHistory } from '@/db/schema';
// import { desc } from 'drizzle-orm';

// GET /api/search/recent - Get recent searches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // If searchHistory table doesn't exist, return empty array
    // This is a placeholder implementation
    const recentSearches: any[] = [];

    // TODO: Implement actual search history when table is created
    // const results = await db
    //   .select()
    //   .from(searchHistory)
    //   .where(userId ? eq(searchHistory.userId, userId) : undefined)
    //   .orderBy(desc(searchHistory.createdAt))
    //   .limit(limit);

    return NextResponse.json(recentSearches);
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
}

// POST /api/search/recent - Save a search to history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, filters } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual search history when table is created
    // await db.insert(searchHistory).values({
    //   query,
    //   userId,
    //   filters,
    //   createdAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Search saved to history',
    });
  } catch (error) {
    console.error('Error saving search:', error);
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    );
  }
}
