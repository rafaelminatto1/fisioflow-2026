import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/packages - List packages with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status'); // 'active', 'completed', 'expired'

    let packageList;

    if (patientId && status) {
      packageList = await db.select().from(packages)
        .where(and(eq(packages.patientId, patientId), eq(packages.status, status)))
        .orderBy(desc(packages.createdAt));
    } else if (patientId) {
      packageList = await db.select().from(packages)
        .where(eq(packages.patientId, patientId))
        .orderBy(desc(packages.createdAt));
    } else if (status) {
      packageList = await db.select().from(packages)
        .where(eq(packages.status, status))
        .orderBy(desc(packages.createdAt));
    } else {
      packageList = await db.select().from(packages)
        .orderBy(desc(packages.createdAt));
    }

    return NextResponse.json(packageList);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

// POST /api/packages - Create a new package
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.totalSessions || body.price === undefined) {
      return NextResponse.json(
        { error: 'name, totalSessions, and price are required' },
        { status: 400 }
      );
    }

    const newPackage = await db.insert(packages).values({
      patientId: body.patientId || null,
      name: body.name,
      description: body.description || null,
      totalSessions: body.totalSessions,
      usedSessions: body.usedSessions || 0,
      price: body.price,
      status: body.status || 'active',
      expiryDate: body.expiryDate || null,
    }).returning();

    return NextResponse.json(newPackage[0], { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
}
