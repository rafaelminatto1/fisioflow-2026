import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { staff, appointments, patientSessions } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/staff/[id] - Get a specific staff member with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    const staffMember = await db.query.staff.findFirst({
      where: eq(staff.id, id),
    });

    if (!staffMember) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    if (includeStats) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get appointments count this month
      const appointmentsThisMonth = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(appointments)
        .where(
          and(
            eq(appointments.therapistId, id),
            gte(appointments.startTime, startOfMonth),
            lte(appointments.startTime, endOfMonth)
          )
        );

      // Get completed sessions count
      const completedSessions = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(appointments)
        .where(
          and(
            eq(appointments.therapistId, id),
            eq(appointments.status, 'completed'),
            gte(appointments.startTime, startOfMonth),
            lte(appointments.startTime, endOfMonth)
          )
        );

      // Calculate no-show rate
      const noShows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(appointments)
        .where(
          and(
            eq(appointments.therapistId, id),
            eq(appointments.status, 'noshow'),
            gte(appointments.startTime, startOfMonth),
            lte(appointments.startTime, endOfMonth)
          )
        );

      const totalAppts = appointmentsThisMonth[0]?.count || 0;
      const noShowCount = noShows[0]?.count || 0;
      const noShowRate = totalAppts > 0 ? (noShowCount / totalAppts) * 100 : 0;

      return NextResponse.json({
        ...staffMember,
        stats: {
          appointmentsThisMonth: totalAppts,
          completedSessions: completedSessions[0]?.count || 0,
          noShows: noShowCount,
          noShowRate: Math.round(noShowRate * 10) / 10,
          occupancyRate: 0, // Would need schedule config to calculate
        },
      });
    }

    return NextResponse.json(staffMember);
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

    // Invalidate cache
    await invalidatePattern('staff:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete (deactivate) a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    if (hard) {
      // Hard delete - only if no appointments
      const hasAppointments = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(appointments)
        .where(eq(appointments.therapistId, id));

      if (hasAppointments[0]?.count > 0) {
        return NextResponse.json(
          { error: 'Cannot delete staff member with appointments. Use soft delete instead.' },
          { status: 400 }
        );
      }

      await db.delete(staff).where(eq(staff.id, id));
    } else {
      // Soft delete - deactivate
      await db.update(staff)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(staff.id, id));
    }

    // Invalidate cache
    await invalidatePattern('staff:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
