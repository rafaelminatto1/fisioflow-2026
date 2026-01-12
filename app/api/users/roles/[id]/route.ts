import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles, rolePermissions, permissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/users/roles/[id] - Get a single role
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const role = await db.query.roles.findFirst({
      where: eq(roles.id, id),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PUT /api/users/roles/[id] - Update a role
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Check if role is system role
    const existing = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });

    if (existing?.isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      );
    }

    const updated = await db.update(roles)
      .set({
        name: body.name,
        description: body.description,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Update permissions if provided
    if (body.permissions !== undefined) {
      // Delete existing permissions
      await db.delete(rolePermissions)
        .where(eq(rolePermissions.roleId, id));

      // Add new permissions
      if (Array.isArray(body.permissions)) {
        for (const permissionId of body.permissions) {
          await db.insert(rolePermissions).values({
            roleId: id,
            permissionId,
          });
        }
      }
    }

    // Invalidate cache
    await invalidatePattern('roles:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/roles/[id] - Delete a role
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check if role is system role
    const existing = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });

    if (existing?.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    const deleted = await db.delete(roles)
      .where(eq(roles.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('roles:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
