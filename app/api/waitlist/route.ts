import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist } from '@/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// GET /api/waitlist - List waitlist entries with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'scheduled', 'cancelled'
    const date = searchParams.get('date'); // Filter by preferred date

    let entries;

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      entries = await db.select().from(waitlist)
        .where(
          and(
            gte(waitlist.preferredDate, targetDate),
            eq(waitlist.status, 'active')
          )
        )
        .orderBy(desc(waitlist.createdAt));
    } else if (status) {
      entries = await db.select().from(waitlist)
        .where(eq(waitlist.status, status))
        .orderBy(desc(waitlist.createdAt));
    } else {
      entries = await db.select().from(waitlist)
        .orderBy(desc(waitlist.createdAt));
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

// POST /api/waitlist - Create a new waitlist entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientName) {
      return NextResponse.json(
        { error: 'patientName is required' },
        { status: 400 }
      );
    }

    const newEntry = await db.insert(waitlist).values({
      patientId: body.patientId || null,
      patientName: body.patientName,
      phone: body.phone || null,
      preferredDate: body.preferredDate || null,
      preferredTime: body.preferredTime || null,
      notes: body.notes || null,
      status: body.status || 'active',
    }).returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('Error creating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to create waitlist entry' },
      { status: 500 }
    );
  }
}
