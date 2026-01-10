import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyTasks } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET /api/daily-tasks - List daily tasks with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const date = searchParams.get('date');

    let allTasks;

    if (patientId && date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      allTasks = await db.select().from(dailyTasks)
        .where(
          and(
            eq(dailyTasks.patientId, patientId),
            gte(dailyTasks.date, startOfDay),
            lte(dailyTasks.date, endOfDay)
          )
        ).orderBy(dailyTasks.date);
    } else if (patientId) {
      allTasks = await db.select().from(dailyTasks)
        .where(eq(dailyTasks.patientId, patientId))
        .orderBy(dailyTasks.date);
    } else {
      allTasks = await db.select().from(dailyTasks).orderBy(dailyTasks.date);
    }

    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily tasks' },
      { status: 500 }
    );
  }
}

// POST /api/daily-tasks - Create a new daily task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.title) {
      return NextResponse.json(
        { error: 'patientId and title are required' },
        { status: 400 }
      );
    }

    const newTask = await db.insert(dailyTasks).values({
      patientId: body.patientId,
      title: body.title,
      points: body.points || 10,
      completed: body.completed || false,
      date: body.date ? new Date(body.date) : new Date(),
      sourceType: body.sourceType || 'system',
      referenceId: body.referenceId || null,
    }).returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating daily task:', error);
    return NextResponse.json(
      { error: 'Failed to create daily task' },
      { status: 500 }
    );
  }
}
