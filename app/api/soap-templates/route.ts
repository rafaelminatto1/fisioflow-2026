import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { soapTemplates } from '@/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/soap-templates - List all SOAP templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const isActive = searchParams.get('isActive');

    const conditions = [];

    if (category) {
      conditions.push(eq(soapTemplates.category, category as any));
    }
    if (condition) {
      conditions.push(eq(soapTemplates.condition, condition));
    }
    if (isActive !== null) {
      conditions.push(eq(soapTemplates.isActive, isActive === 'true'));
    }

    const templates = await db.select()
      .from(soapTemplates)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(soapTemplates.isSystem), desc(soapTemplates.usageCount), asc(soapTemplates.name));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching SOAP templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOAP templates' },
      { status: 500 }
    );
  }
}

// POST /api/soap-templates - Create a new SOAP template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.category || !body.subjective || !body.objective || !body.assessment || !body.plan) {
      return NextResponse.json(
        { error: 'name, category, subjective, objective, assessment, and plan are required' },
        { status: 400 }
      );
    }

    const newTemplate = await db.insert(soapTemplates).values({
      id: nanoid(),
      name: body.name,
      description: body.description || null,
      category: body.category,
      condition: body.condition || null,
      subjective: body.subjective,
      objective: body.objective,
      assessment: body.assessment,
      plan: body.plan,
      variables: body.variables || null,
      isActive: body.isActive ?? true,
      isSystem: body.isSystem ?? false,
      createdBy: body.createdBy || null,
      organizationId: body.organizationId || null,
      usageCount: 0,
    }).returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error('Error creating SOAP template:', error);
    return NextResponse.json(
      { error: 'Failed to create SOAP template' },
      { status: 500 }
    );
  }
}
