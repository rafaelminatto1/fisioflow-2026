import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { staff } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/staff - List all staff members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active'); // 'true' or 'false'
    const role = searchParams.get('role'); // 'physiotherapist', 'receptionist', 'admin'

    let staffList;

    if (isActive && role) {
      const activeBool = isActive === 'true';
      staffList = await db.select().from(staff)
        .where(eq(staff.role, role))
        .orderBy(desc(staff.createdAt));

      // Filter by isActive in JS since we have two conditions
      staffList = staffList.filter(s => s.isActive === activeBool);
    } else if (isActive) {
      const activeBool = isActive === 'true';
      staffList = await db.select().from(staff)
        .where(eq(staff.isActive, activeBool))
        .orderBy(desc(staff.createdAt));
    } else if (role) {
      staffList = await db.select().from(staff)
        .where(eq(staff.role, role))
        .orderBy(desc(staff.createdAt));
    } else {
      staffList = await db.select().from(staff)
        .orderBy(desc(staff.createdAt));
    }

    return NextResponse.json(staffList);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { error: 'name, email, and role are required' },
        { status: 400 }
      );
    }

    const newStaff = await db.insert(staff).values({
      userId: body.userId || null,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role,
      specialty: body.specialty || null,
      licenseNumber: body.licenseNumber || null,
      hireDate: body.hireDate || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    }).returning();

    return NextResponse.json(newStaff[0], { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
