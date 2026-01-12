import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { telemedicineSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/telemedicine/settings - Get telemedicine settings
export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'telemedicine-settings';

    const settings = await withCache(
      cacheKey,
      async () => {
        const result = await db.query.telemedicineSettings.findMany({
          where: eq(telemedicineSettings.isActive, true),
        });

        // Return first active settings or default
        return result[0] || {
          id: 'default',
          provider: 'whereby',
          defaultDuration: 30,
          bufferTime: 0,
          isActive: true,
        };
      },
      { ttl: 600 }
    );

    // Don't expose API secret in response
    const { apiSecret, ...safeSettings } = settings as any;

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error('Error fetching telemedicine settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch telemedicine settings' },
      { status: 500 }
    );
  }
}

// POST /api/telemedicine/settings - Update telemedicine settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if settings exist
    const existing = await db.query.telemedicineSettings.findFirst();

    let updated;

    if (existing) {
      updated = await db.update(telemedicineSettings)
        .set({
          provider: body.provider,
          apiKey: body.apiKey,
          apiSecret: body.apiSecret,
          defaultDuration: body.defaultDuration || 30,
          bufferTime: body.bufferTime || 0,
          isActive: body.isActive !== undefined ? body.isActive : true,
          updatedAt: new Date(),
        })
        .where(eq(telemedicineSettings.id, existing.id as string))
        .returning();
    } else {
      updated = await db.insert(telemedicineSettings).values({
        provider: body.provider || 'whereby',
        apiKey: body.apiKey || null,
        apiSecret: body.apiSecret || null,
        defaultDuration: body.defaultDuration || 30,
        bufferTime: body.bufferTime || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      }).returning();
    }

    // Invalidate cache
    await invalidatePattern('telemedicine-settings');

    // Don't expose API secret in response
    const { apiSecret, ...safeSettings } = updated[0];

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error('Error updating telemedicine settings:', error);
    return NextResponse.json(
      { error: 'Failed to update telemedicine settings' },
      { status: 500 }
    );
  }
}
