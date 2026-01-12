import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, userRoles, roles, rolePermissions, permissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/rbac/permissions - Get all permissions for a user
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

    // Get user's roles
    const userRoleList = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
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

    // Collect all permissions
    const userPermissions: any[] = [];
    const userRolesList: any[] = [];

    for (const userRole of userRoleList) {
      const role = userRole.role;
      userRolesList.push({
        id: role.id,
        name: role.name,
        description: role.description,
      });

      if (role?.rolePermissions) {
        for (const rp of role.rolePermissions) {
          if (rp.permission) {
            userPermissions.push(rp.permission);
          }
        }
      }
    }

    // Group permissions by resource
    const grouped = userPermissions.reduce((acc: any, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm.action);
      return acc;
    }, {});

    return NextResponse.json({
      userId,
      roles: userRolesList,
      permissions: userPermissions,
      permissionsByResource: grouped,
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user permissions' },
      { status: 500 }
    );
  }
}
