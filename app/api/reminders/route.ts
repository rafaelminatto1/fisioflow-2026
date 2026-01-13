import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reminderRules, appointments, patients } from '@/db/schema';
import { eq, and, gte, or } from 'drizzle-orm';

// GET /api/reminders - List all reminder rules
export async function GET(request: NextRequest) {
  try {
    const rules = await db.select().from(reminderRules).orderBy(reminderRules.createdAt);
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching reminder rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminder rules' },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Create a new reminder rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, trigger, channel, template, isActive } = body;

    if (!name || !type || !trigger || !channel || !template) {
      return NextResponse.json(
        { error: 'name, type, trigger, channel, and template are required' },
        { status: 400 }
      );
    }

    const [rule] = await db.insert(reminderRules).values({
      name,
      type,
      trigger,
      channel,
      template,
      isActive: isActive ?? true,
    }).returning();

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error creating reminder rule:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder rule' },
      { status: 500 }
    );
  }
}
