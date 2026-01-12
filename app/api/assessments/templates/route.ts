import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTemplates } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/assessments/templates - List all assessment templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const category = searchParams.get('category');

    const cacheKey = `assessment-templates:${activeOnly ? 'active' : 'all'}${category ? `:${category}` : ''}`;

    const templates = await withCache(
      cacheKey,
      async () => {
        let whereClause = undefined;

        if (activeOnly) {
          whereClause = eq(assessmentTemplates.isActive, true);
        } else if (category) {
          whereClause = eq(assessmentTemplates.category, category);
        }

        return await db.query.assessmentTemplates.findMany({
          where: whereClause,
          orderBy: [desc(assessmentTemplates.createdAt)],
          with: {
            createdByStaff: true,
          },
        });
      },
      { ttl: 600 }
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching assessment templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment templates' },
      { status: 500 }
    );
  }
}

// POST /api/assessments/templates - Create a new assessment template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { error: 'name and questions (array) are required' },
        { status: 400 }
      );
    }

    const newTemplate = await db.insert(assessmentTemplates).values({
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      questions: body.questions,
      scoringMethod: body.scoringMethod || null,
      maxScore: body.maxScore || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: body.createdBy || null,
    }).returning();

    // Invalidate cache
    await invalidatePattern('assessment-templates:*');

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Error creating assessment template:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment template' },
      { status: 500 }
    );
  }
}
