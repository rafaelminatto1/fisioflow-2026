import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insurancePlans } from '@/db/schema';
import { eq, desc, ilike, or } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/insurance-plans - List all insurance plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    const cacheKey = `insurance-plans:${active || 'all'}:${search || 'none'}`;

    const plans = await withCache(
      cacheKey,
      async () => {
        let query = db.select().from(insurancePlans);

        if (active !== null) {
          query = query.where(eq(insurancePlans.isActive, active === 'true')) as any;
        }

        if (search) {
          query = query.where(
            or(
              ilike(insurancePlans.name, `%${search}%`),
              ilike(insurancePlans.ansCode as any, `%${search}%`)
            )
          ) as any;
        }

        return await query.orderBy(desc(insurancePlans.createdAt));
      },
      { ttl: 300 }
    );

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching insurance plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance plans' },
      { status: 500 }
    );
  }
}

// POST /api/insurance-plans - Create a new insurance plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const newPlan = await db.insert(insurancePlans).values({
      name: body.name,
      ansCode: body.ansCode || null,
      cnpj: body.cnpj || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    }).returning();

    // Invalidate cache
    await invalidatePattern('insurance-plans:*');

    return NextResponse.json(newPlan[0], { status: 201 });
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to create insurance plan' },
      { status: 500 }
    );
  }
}
