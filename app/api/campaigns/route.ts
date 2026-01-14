import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, patients, leads, staff } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';
import { sendBulkMessages } from '@/lib/whatsapp';

// GET /api/campaigns - List campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = `campaigns:${status || 'all'}:${type || 'all'}:${limit}`;

    const campaignsList = await withCache(
      cacheKey,
      async () => {
        return await db.query.campaigns.findMany({
          with: {
            createdByStaff: true,
          },
          orderBy: [desc(campaigns.createdAt)],
          limit,
        });
      },
      { ttl: 120 }
    );

    // Apply filters
    let filtered = campaignsList;

    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }

    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.message) {
      return NextResponse.json(
        { error: 'name, type, and message are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['whatsapp', 'email', 'sms'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Build recipients list if not provided
    let recipients = body.recipients || [];

    if (!body.recipients && body.targetAudience) {
      // Auto-generate recipients based on target audience
      if (body.targetAudience === 'all_patients') {
        const allPatients = await db.query.patients.findMany({
          where: eq(patients.isActive, true),
        });
        recipients = allPatients.map(p => ({
          id: p.id,
          name: p.fullName,
          phone: p.phone,
          email: p.email,
        }));
      } else if (body.targetAudience === 'all_leads') {
        const allLeads = await db.query.leads.findMany();
        recipients = allLeads.map(l => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email,
        }));
      } else if (body.targetAudience === 'inactive_patients') {
        const inactivePatients = await db.query.patients.findMany({
          where: eq(patients.isActive, false),
        });
        recipients = inactivePatients.map(p => ({
          id: p.id,
          name: p.fullName,
          phone: p.phone,
          email: p.email,
        }));
      }
    }

    const newCampaign = await db.insert(campaigns).values({
      name: body.name,
      description: body.description || null,
      type: body.type,
      status: body.scheduledFor ? 'scheduled' : 'draft',
      message: body.message,
      recipients: recipients,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      createdBy: body.createdBy || null,
    }).returning();

    // Invalidate cache
    await invalidatePattern('campaigns:*');

    return NextResponse.json(newCampaign[0], { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
