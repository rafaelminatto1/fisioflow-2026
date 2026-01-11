import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/packages/[id] - Get a specific package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pkg = await db.select().from(packages).where(eq(packages.id, id));

    if (!pkg || pkg.length === 0) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg[0]);
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

// PUT /api/packages/[id] - Update a package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(packages)
      .set({
        name: body.name,
        description: body.description,
        totalSessions: body.totalSessions,
        usedSessions: body.usedSessions,
        price: body.price,
        status: body.status,
        expiryDate: body.expiryDate,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

// DELETE /api/packages/[id] - Delete a package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db.delete(packages)
      .where(eq(packages.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}
