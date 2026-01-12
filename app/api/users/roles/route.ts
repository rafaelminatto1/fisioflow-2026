import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roles, rolePermissions, permissions, userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/users/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'roles:all';

    const rolesList = await withCache(
      cacheKey,
      async () => {
        return await db.query.roles.findMany({
          with: {
            rolePermissions: {
              with: {
                permission: true,
              },
            },
          },
          orderBy: [roles.createdAt],
        });
      },
      { ttl: 600 }
    );

    return NextResponse.json(rolesList);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/users/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const newRole = await db.insert(roles).values({
      name: body.name,
      description: body.description || null,
      isSystem: false,
    }).returning();

    // Add permissions if provided
    if (body.permissions && Array.isArray(body.permissions)) {
      for (const permissionId of body.permissions) {
        await db.insert(rolePermissions).values({
          roleId: newRole[0].id,
          permissionId,
        });
      }
    }

    // Invalidate cache
    await invalidatePattern('roles:*');

    return NextResponse.json(newRole[0], { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
