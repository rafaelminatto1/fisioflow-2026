import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { permissions } from '@/db/schema';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/users/permissions - List all permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');

    const cacheKey = `permissions:${resource || 'all'}`;

    const permsList = await withCache(
      cacheKey,
      async () => {
        return await db.query.permissions.findMany({
          orderBy: [permissions.resource, permissions.action],
        });
      },
      { ttl: 600 }
    );

    // Group by resource
    const grouped = permsList.reduce((acc: any, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {});

    return NextResponse.json({
      grouped,
      all: permsList,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

// POST /api/users/permissions - Create a new permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.resource || !body.action) {
      return NextResponse.json(
        { error: 'resource and action are required' },
        { status: 400 }
      );
    }

    const newPermission = await db.insert(permissions).values({
      resource: body.resource,
      action: body.action,
      description: body.description || null,
    }).returning();

    // Invalidate cache
    await invalidatePattern('permissions:*');

    return NextResponse.json(newPermission[0], { status: 201 });
  } catch (error) {
    console.error('Error creating permission:', error);
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}
