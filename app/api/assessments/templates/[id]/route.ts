import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/assessments/templates/[id] - Get a single template
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const template = await db.query.assessmentTemplates.findFirst({
      where: eq(assessmentTemplates.id, id),
      with: {
        createdByStaff: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Assessment template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching assessment template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment template' },
      { status: 500 }
    );
  }
}

// PUT /api/assessments/templates/[id] - Update a template
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.update(assessmentTemplates)
      .set({
        name: body.name,
        description: body.description,
        category: body.category,
        questions: body.questions,
        scoringMethod: body.scoringMethod,
        maxScore: body.maxScore,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(assessmentTemplates.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Assessment template not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('assessment-templates:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating assessment template:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment template' },
      { status: 500 }
    );
  }
}

// DELETE /api/assessments/templates/[id] - Delete a template
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const deleted = await db.delete(assessmentTemplates)
      .where(eq(assessmentTemplates.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Assessment template not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('assessment-templates:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment template:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment template' },
      { status: 500 }
    );
  }
}
