import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { staff } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/staff/[id] - Get a specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const staffMember = await db.select().from(staff).where(eq(staff.id, id));

    if (!staffMember || staffMember.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(staffMember[0]);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/[id] - Update a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(staff)
      .set({
        userId: body.userId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        specialty: body.specialty,
        licenseNumber: body.licenseNumber,
        hireDate: body.hireDate,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db.delete(staff)
      .where(eq(staff.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
