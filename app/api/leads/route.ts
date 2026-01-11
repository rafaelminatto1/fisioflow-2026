import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/leads - List all leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'new', 'contacted', 'qualified', 'converted', 'lost'
    const source = searchParams.get('source'); // 'whatsapp', 'instagram', 'referral', 'website'

    let leadsList;

    if (status && source) {
      leadsList = await db.select().from(leads)
        .where(and(eq(leads.status, status), eq(leads.source, source)))
        .orderBy(desc(leads.createdAt));
    } else if (status) {
      leadsList = await db.select().from(leads)
        .where(eq(leads.status, status))
        .orderBy(desc(leads.createdAt));
    } else if (source) {
      leadsList = await db.select().from(leads)
        .where(eq(leads.source, source))
        .orderBy(desc(leads.createdAt));
    } else {
      leadsList = await db.select().from(leads)
        .orderBy(desc(leads.createdAt));
    }

    return NextResponse.json(leadsList);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'name and phone are required' },
        { status: 400 }
      );
    }

    const newLead = await db.insert(leads).values({
      name: body.name,
      email: body.email || null,
      phone: body.phone,
      source: body.source || null,
      status: body.status || 'new',
      notes: body.notes || null,
      budget: body.budget || null,
    }).returning();

    return NextResponse.json(newLead[0], { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
