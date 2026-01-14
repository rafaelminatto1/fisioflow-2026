import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tissGuides, patients, insurancePlans, staff } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';
import { nanoid } from 'nanoid';

// Helper to generate TISS guide number
function generateGuideNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TISS-${timestamp}-${random}`;
}

// GET /api/tiss-guides - List TISS guides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const insurancePlanId = searchParams.get('insurancePlanId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = `tiss-guides:${patientId || 'all'}:${status || 'all'}:${limit}`;

    const guides = await withCache(
      cacheKey,
      async () => {
        return await db.query.tissGuides.findMany({
          where: patientId ? eq(tissGuides.patientId, patientId) : undefined,
          with: {
            patient: true,
            insurancePlan: true,
            createdByStaff: true,
          },
          orderBy: [desc(tissGuides.createdAt)],
          limit,
        });
      },
      { ttl: 120 }
    );

    // Apply additional filters in JS for simplicity
    let filtered = guides;
    
    if (insurancePlanId) {
      filtered = filtered.filter(g => g.insurancePlanId === insurancePlanId);
    }
    
    if (status) {
      filtered = filtered.filter(g => g.status === status);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(g => new Date(g.createdAt) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(g => new Date(g.createdAt) <= end);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching TISS guides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TISS guides' },
      { status: 500 }
    );
  }
}

// POST /api/tiss-guides - Create a new TISS guide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.guideType || !body.procedures || !Array.isArray(body.procedures)) {
      return NextResponse.json(
        { error: 'patientId, guideType, and procedures (array) are required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, body.patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Calculate total amount from procedures
    const totalAmount = body.procedures.reduce((sum: number, proc: any) => {
      return sum + (proc.totalValue || proc.quantity * proc.unitValue || 0);
    }, 0);

    const newGuide = await db.insert(tissGuides).values({
      patientId: body.patientId,
      insurancePlanId: body.insurancePlanId || null,
      guideNumber: body.guideNumber || generateGuideNumber(),
      guideType: body.guideType,
      authorizationNumber: body.authorizationNumber || null,
      sessionId: body.sessionId || null,
      procedures: body.procedures,
      totalAmount: Math.round(totalAmount * 100), // Convert to cents
      status: body.status || 'pending',
      submissionDate: body.submissionDate ? new Date(body.submissionDate) : null,
      createdBy: body.createdBy || null,
    }).returning();

    // Invalidate cache
    await invalidatePattern('tiss-guides:*');

    return NextResponse.json(newGuide[0], { status: 201 });
  } catch (error) {
    console.error('Error creating TISS guide:', error);
    return NextResponse.json(
      { error: 'Failed to create TISS guide' },
      { status: 500 }
    );
  }
}
