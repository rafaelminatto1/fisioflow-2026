import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// Default schedule settings
const DEFAULT_SCHEDULE = {
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  workingHours: {
    start: '08:00',
    end: '19:00',
  },
  lunchBreak: {
    start: '12:00',
    end: '13:00',
  },
  slotDuration: 60, // minutes
  appointments: [
    { day: 'monday', slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
    { day: 'tuesday', slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
    { day: 'wednesday', slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
    { day: 'thursday', slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
    { day: 'friday', slots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
  ],
};

// GET /api/settings/schedule - Get clinic schedule settings
export async function GET() {
  try {
    const cacheKey = 'clinic-settings:schedule';

    const schedule = await withCache(
      cacheKey,
      async () => {
        const settings = await db.query.clinicSettings.findFirst({
          where: eq(clinicSettings.key, 'schedule'),
        });

        if (settings?.value) {
          return settings.value;
        }

        return DEFAULT_SCHEDULE;
      },
      { ttl: 600 }
    );

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/schedule - Update clinic schedule settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement actual schedule update to clinic_settings
    // await db.update(clinicSettings).set({
    //   schedule: body,
    //   updatedAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Schedule settings updated',
      data: body,
    });
  } catch (error) {
    console.error('Error updating schedule settings:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule settings' },
      { status: 500 }
    );
  }
}
