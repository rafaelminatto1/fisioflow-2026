import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/waitlist/find-matches?date=YYYY-MM-DD&time=HH:MM - Find matching waitlist entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!date || !time) {
      return NextResponse.json(
        { error: 'date and time query parameters are required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);

    // Find active waitlist entries that match the preferred date and time
    const matches = await db.select({
      id: waitlist.id,
      patientId: waitlist.patientId,
      patientName: waitlist.patientName,
      phone: waitlist.phone,
      preferredDate: waitlist.preferredDate,
      preferredTime: waitlist.preferredTime,
      notes: waitlist.notes,
      status: waitlist.status,
      createdAt: waitlist.createdAt,
      updatedAt: waitlist.updatedAt,
    })
    .from(waitlist)
    .where(
      and(
        eq(waitlist.status, 'active'),
        sql`${waitlist.preferredDate}::date = ${targetDate}::date`,
        sql`${waitlist.preferredTime} = ${time}`
      )
    );

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error finding waitlist matches:', error);
    return NextResponse.json(
      { error: 'Failed to find waitlist matches' },
      { status: 500 }
    );
  }
}
