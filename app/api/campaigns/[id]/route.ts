import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/campaigns/[id] - Get a specific campaign
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
      with: {
        createdByStaff: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get current campaign
    const current = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!current) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Only allow editing draft or scheduled campaigns
    if (!['draft', 'scheduled'].includes(current.status)) {
      return NextResponse.json(
        { error: `Cannot edit a campaign with status: ${current.status}` },
        { status: 400 }
      );
    }

    const updated = await db.update(campaigns)
      .set({
        name: body.name,
        description: body.description,
        type: body.type,
        message: body.message,
        recipients: body.recipients,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
        status: body.scheduledFor ? 'scheduled' : 'draft',
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('campaigns:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get current campaign
    const current = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!current) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Only allow deleting draft or scheduled campaigns
    if (!['draft', 'scheduled', 'cancelled'].includes(current.status)) {
      return NextResponse.json(
        { error: `Cannot delete a campaign with status: ${current.status}` },
        { status: 400 }
      );
    }

    const deleted = await db.delete(campaigns)
      .where(eq(campaigns.id, id))
      .returning();

    // Invalidate cache
    await invalidatePattern('campaigns:*');

    return NextResponse.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
