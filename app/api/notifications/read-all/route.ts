import { NextRequest, NextResponse } from 'next/server';

// PUT /api/notifications/read-all - Alias for /api/notifications/mark-read
export async function PUT(request: NextRequest) {
  try {
    // Forward to the existing mark-read endpoint
    const response = await fetch(
      new URL('/api/notifications/mark-read', request.url),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
