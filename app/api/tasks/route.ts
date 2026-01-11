import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo'); // staff ID
    const status = searchParams.get('status'); // 'pending', 'in_progress', 'completed'
    const priority = searchParams.get('priority'); // 'low', 'medium', 'high'

    let taskList;

    // Build conditions based on filters
    if (assignedTo && status && priority) {
      taskList = await db.select().from(tasks)
        .where(
          and(
            eq(tasks.assignedTo, assignedTo),
            eq(tasks.status, status),
            eq(tasks.priority, priority)
          )
        )
        .orderBy(desc(tasks.createdAt));
    } else if (assignedTo && status) {
      taskList = await db.select().from(tasks)
        .where(
          and(
            eq(tasks.assignedTo, assignedTo),
            eq(tasks.status, status)
          )
        )
        .orderBy(desc(tasks.createdAt));
    } else if (assignedTo) {
      taskList = await db.select().from(tasks)
        .where(eq(tasks.assignedTo, assignedTo))
        .orderBy(desc(tasks.createdAt));
    } else if (status) {
      taskList = await db.select().from(tasks)
        .where(eq(tasks.status, status))
        .orderBy(desc(tasks.createdAt));
    } else if (priority) {
      taskList = await db.select().from(tasks)
        .where(eq(tasks.priority, priority))
        .orderBy(desc(tasks.createdAt));
    } else {
      taskList = await db.select().from(tasks)
        .orderBy(desc(tasks.createdAt));
    }

    return NextResponse.json(taskList);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const newTask = await db.insert(tasks).values({
      title: body.title,
      description: body.description || null,
      assignedTo: body.assignedTo || null,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      dueDate: body.dueDate || null,
    }).returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
