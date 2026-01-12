import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, userRoles, roles, rolePermissions, permissions } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

// POST /api/rbac/check - Check if user has permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.resource || !body.action) {
      return NextResponse.json(
        { error: 'userId, resource, and action are required' },
        { status: 400 }
      );
    }

    // Get user's roles
    const userRoleList = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, body.userId),
      with: {
        role: {
          with: {
            rolePermissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Check if user has the required permission
    let hasPermission = false;
    let permissionDetails = null;

    for (const userRole of userRoleList) {
      const role = userRole.role as any;
      if (role?.rolePermissions) {
        for (const rp of role.rolePermissions) {
          if (rp.permission?.resource === body.resource && rp.permission?.action === body.action) {
            hasPermission = true;
            permissionDetails = rp.permission;
            break;
          }
        }
      }
      if (hasPermission) break;
    }

    return NextResponse.json({
      hasPermission,
      permission: permissionDetails,
      userId: body.userId,
      resource: body.resource,
      action: body.action,
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    return NextResponse.json(
      { error: 'Failed to check permission' },
      { status: 500 }
    );
  }
}
