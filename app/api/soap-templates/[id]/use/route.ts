import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { soapTemplates } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// POST /api/soap-templates/[id]/use - Increment usage count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Increment usage count
    const updated = await db.update(soapTemplates)
      .set({
        usageCount: sql`${soapTemplates.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(soapTemplates.id, id))
      .returning();

    if (!updated[0]) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, usageCount: updated[0].usageCount });
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage count' },
      { status: 500 }
    );
  }
}
