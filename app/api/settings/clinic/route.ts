import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/settings/clinic - Get clinic settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'general', 'notification', 'integrations', 'telemedicine'

    const cacheKey = `clinic-settings:${category || 'all'}`;

    const settings = await withCache(
      cacheKey,
      async () => {
        let whereClause = undefined;
        if (category) {
          whereClause = eq(clinicSettings.category, category);
        }

        const result = await db.query.clinicSettings.findMany({
          where: whereClause,
        });

        // Convert array to key-value object
        const settingsObj: Record<string, any> = {};
        result.forEach((s) => {
          settingsObj[s.key] = s.value;
        });

        return settingsObj;
      },
      { ttl: 600 }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching clinic settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/clinic - Update clinic settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.settings || typeof body.settings !== 'object') {
      return NextResponse.json(
        { error: 'settings object is required' },
        { status: 400 }
      );
    }

    // Update each setting
    for (const [key, value] of Object.entries(body.settings)) {
      const existing = await db.query.clinicSettings.findFirst({
        where: eq(clinicSettings.key, key),
      });

      if (existing) {
        await db.update(clinicSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(clinicSettings.key, key));
      } else {
        await db.insert(clinicSettings).values({
          key,
          value,
          description: body.descriptions?.[key] || null,
          category: body.categories?.[key] || 'general',
        });
      }
    }

    // Invalidate cache
    await invalidatePattern('clinic-settings:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating clinic settings:', error);
    return NextResponse.json(
      { error: 'Failed to update clinic settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/clinic - Delete a setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'key parameter is required' },
        { status: 400 }
      );
    }

    await db.delete(clinicSettings)
      .where(eq(clinicSettings.key, key));

    // Invalidate cache
    await invalidatePattern('clinic-settings:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting clinic setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete clinic setting' },
      { status: 500 }
    );
  }
}
