import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tissGuides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/tiss-guides/[id]/submit - Submit a TISS guide to insurance
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get the current guide
    const guide = await db.query.tissGuides.findFirst({
      where: eq(tissGuides.id, id),
      with: {
        insurancePlan: true,
      },
    });

    if (!guide) {
      return NextResponse.json(
        { error: 'TISS guide not found' },
        { status: 404 }
      );
    }

    if (guide.status !== 'pending') {
      return NextResponse.json(
        { error: `Guide is already ${guide.status}. Only pending guides can be submitted.` },
        { status: 400 }
      );
    }

    if (!guide.insurancePlanId) {
      return NextResponse.json(
        { error: 'Guide must have an insurance plan before submission' },
        { status: 400 }
      );
    }

    // In a real implementation, this would integrate with the insurance company's API
    // For now, we just update the status
    const updated = await db.update(tissGuides)
      .set({
        status: 'submitted',
        submissionDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tissGuides.id, id))
      .returning();

    // Invalidate cache
    await invalidatePattern('tiss-guides:*');

    return NextResponse.json({
      success: true,
      message: 'TISS guide submitted successfully',
      guide: updated[0],
      // In production, this would include the submission confirmation from the insurance API
      submissionConfirmation: {
        timestamp: new Date().toISOString(),
        protocolNumber: `PROT-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Error submitting TISS guide:', error);
    return NextResponse.json(
      { error: 'Failed to submit TISS guide' },
      { status: 500 }
    );
  }
}
