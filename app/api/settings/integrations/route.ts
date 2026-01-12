import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/settings/integrations - Get integrations settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider'); // 'whatsapp', 'email', 'zoom', etc.

    const whereClause = provider
      ? and(eq(clinicSettings.category, 'integrations'), eq(clinicSettings.key, `${provider}_config`))
      : eq(clinicSettings.category, 'integrations');

    const settings = await db.query.clinicSettings.findMany({
      where: whereClause,
    });

    // Return settings without sensitive data
    const sanitized = settings.map((s) => {
      const value = s.value as any;
      // Remove API keys/secrets from response
      if (value.apiKey) value.apiKey = '***REDACTED***';
      if (value.apiSecret) value.apiSecret = '***REDACTED***';
      if (value.token) value.token = '***REDACTED***';
      return { key: s.key, value, category: s.category };
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Error fetching integrations settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/integrations - Update integration settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.provider || !body.config) {
      return NextResponse.json(
        { error: 'provider and config are required' },
        { status: 400 }
      );
    }

    const key = `${body.provider}_config`;

    // Check if integration exists
    const existing = await db.query.clinicSettings.findFirst({
      where: eq(clinicSettings.key, key),
    });

    if (existing) {
      // Merge with existing config (preserve fields not being updated)
      const mergedConfig = { ...(existing.value as any), ...body.config };
      await db.update(clinicSettings)
        .set({ value: mergedConfig, updatedAt: new Date() })
        .where(eq(clinicSettings.key, key));
    } else {
      await db.insert(clinicSettings).values({
        key,
        value: body.config,
        description: `${body.provider} integration configuration`,
        category: 'integrations',
      });
    }

    // Invalidate cache
    await invalidatePattern('clinic-settings:*');

    return NextResponse.json({ success: true, provider: body.provider });
  } catch (error) {
    console.error('Error updating integrations settings:', error);
    return NextResponse.json(
      { error: 'Failed to update integrations settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/integrations - Remove integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { error: 'provider parameter is required' },
        { status: 400 }
      );
    }

    const key = `${provider}_config`;

    await db.delete(clinicSettings)
      .where(eq(clinicSettings.key, key));

    // Invalidate cache
    await invalidatePattern('clinic-settings:*');

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Error removing integration:', error);
    return NextResponse.json(
      { error: 'Failed to remove integration' },
      { status: 500 }
    );
  }
}
