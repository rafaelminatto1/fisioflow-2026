import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications/unread/count - Alias for /api/notifications/count
export async function GET(request: NextRequest) {
  try {
    // Forward to the existing count endpoint
    const response = await fetch(
      new URL('/api/notifications/count', request.url),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
