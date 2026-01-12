import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// Default clinic settings
const DEFAULT_CLINIC_SETTINGS = {
  name: 'FisioFlow Clínica',
  phone: '',
  email: 'contato@fisioflow.com.br',
  address: {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  workingHours: {
    monday: { open: '08:00', close: '18:00', enabled: true },
    tuesday: { open: '08:00', close: '18:00', enabled: true },
    wednesday: { open: '08:00', close: '18:00', enabled: true },
    thursday: { open: '08:00', close: '18:00', enabled: true },
    friday: { open: '08:00', close: '18:00', enabled: true },
    saturday: { open: '08:00', close: '12:00', enabled: false },
    sunday: { open: '00:00', close: '00:00', enabled: false },
  },
  appointmentDuration: 60, // minutes
  bufferTime: 0, // minutes
  currency: 'BRL',
  locale: 'pt-BR',
  timezone: 'America/Sao_Paulo',
};

// GET /api/settings/general - Get general clinic settings
export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'clinic-settings:general';

    const settings = await withCache(
      cacheKey,
      async () => {
        const result = await db.query.clinicSettings.findMany({
          where: eq(clinicSettings.category, 'general'),
        });

        // Convert array to object, merging with defaults
        const settingsObj = { ...DEFAULT_CLINIC_SETTINGS };
        result.forEach((s) => {
          if (s.key === 'clinic_info') {
            Object.assign(settingsObj, s.value);
          } else {
            (settingsObj as any)[s.key] = s.value;
          }
        });

        return settingsObj;
      },
      { ttl: 600 }
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching general settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch general settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/general - Update general settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Update clinic_info
    await db.insert(clinicSettings).values({
      key: 'clinic_info',
      value: body,
      description: 'General clinic information',
      category: 'general',
    }).onConflictDoUpdate({
      target: clinicSettings.key,
      set: {
        value: body,
        updatedAt: new Date(),
      },
    });

    // Invalidate cache
    await invalidatePattern('clinic-settings:*');

    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error('Error updating general settings:', error);
    return NextResponse.json(
      { error: 'Failed to update general settings' },
      { status: 500 }
    );
  }
}
