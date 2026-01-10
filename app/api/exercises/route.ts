import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/exercises - List all exercises
export async function GET() {
  try {
    const allExercises = await db.select().from(exercises).orderBy(exercises.createdAt);

    return NextResponse.json(allExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create a new exercise
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

    const newExercise = await db.insert(exercises).values({
      title: body.title,
      description: body.description || null,
      category: body.category || null,
      videoUrl: body.videoUrl || null,
    }).returning();

    return NextResponse.json(newExercise[0], { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
