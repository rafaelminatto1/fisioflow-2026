import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, patientTags, patients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withCache, invalidatePattern, CacheKeys } from '@/lib/vercel-kv';

// GET /api/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (patientId) {
      // Get tags for a specific patient
      const patientTagsList = await db
        .select({
          id: tags.id,
          name: tags.name,
          color: tags.color,
        })
        .from(tags)
        .innerJoin(patientTags, eq(patientTags.tagId, tags.id))
        .where(eq(patientTags.patientId, patientId))
        .orderBy(tags.name);

      return NextResponse.json(patientTagsList);
    }

    // Get all tags
    const allTags = await withCache(
      'tags:all',
      async () => {
        return await db.select().from(tags).orderBy(tags.name);
      },
      { ttl: 600 } // 10 minutes cache
    );

    return NextResponse.json(allTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const newTag = await db.insert(tags).values({
      name: body.name,
      color: body.color || '#3B82F6',
    }).returning();

    // Invalidate cache
    await invalidatePattern('tags:*');

    return NextResponse.json(newTag[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags - Update a tag
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const updated = await db.update(tags)
      .set({
        name: body.name,
        color: body.color,
      })
      .where(eq(tags.id, body.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await invalidatePattern('tags:*');

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags - Delete a tag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.delete(tags).where(eq(tags.id, id));

    // Invalidate cache
    await invalidatePattern('tags:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
