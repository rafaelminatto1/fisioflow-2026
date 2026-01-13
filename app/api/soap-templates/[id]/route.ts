import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { soapTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/soap-templates/[id] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await db.select().from(soapTemplates).where(eq(soapTemplates.id, id)).limit(1);

    if (!template[0]) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error('Error fetching SOAP template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOAP template' },
      { status: 500 }
    );
  }
}

// PUT /api/soap-templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if template exists
    const existing = await db.select().from(soapTemplates).where(eq(soapTemplates.id, id)).limit(1);
    if (!existing[0]) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Don't allow modification of system templates
    if (existing[0].isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system templates' },
        { status: 403 }
      );
    }

    const updated = await db.update(soapTemplates)
      .set({
        name: body.name,
        description: body.description,
        category: body.category,
        condition: body.condition,
        subjective: body.subjective,
        objective: body.objective,
        assessment: body.assessment,
        plan: body.plan,
        variables: body.variables,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(soapTemplates.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating SOAP template:', error);
    return NextResponse.json(
      { error: 'Failed to update SOAP template' },
      { status: 500 }
    );
  }
}

// DELETE /api/soap-templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if template exists
    const existing = await db.select().from(soapTemplates).where(eq(soapTemplates.id, id)).limit(1);
    if (!existing[0]) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of system templates
    if (existing[0].isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system templates' },
        { status: 403 }
      );
    }

    await db.delete(soapTemplates).where(eq(soapTemplates.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting SOAP template:', error);
    return NextResponse.json(
      { error: 'Failed to delete SOAP template' },
      { status: 500 }
    );
  }
}
