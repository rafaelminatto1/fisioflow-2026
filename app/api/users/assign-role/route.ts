import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userRoles, roles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/users/assign-role - Get user roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userRoleAssignments = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      with: {
        role: true,
      },
    });

    return NextResponse.json(userRoleAssignments);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
      { status: 500 }
    );
  }
}

// POST /api/users/assign-role - Assign a role to a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.roleId) {
      return NextResponse.json(
        { error: 'userId and roleId are required' },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, body.roleId),
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existing = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, body.userId),
        eq(userRoles.roleId, body.roleId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Role already assigned to user' },
        { status: 400 }
      );
    }

    const newAssignment = await db.insert(userRoles).values({
      userId: body.userId,
      roleId: body.roleId,
    }).returning();

    // Invalidate cache
    await invalidatePattern('users:*');
    await invalidatePattern('roles:*');

    return NextResponse.json(newAssignment[0], { status: 201 });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/assign-role - Remove a role from a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'userId and roleId are required' },
        { status: 400 }
      );
    }

    const deleted = await db.delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('users:*');
    await invalidatePattern('roles:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing role:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}
