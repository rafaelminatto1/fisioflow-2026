import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// Default clinic data structure
const DEFAULT_CLINIC = {
  name: 'Clínica Exemplo Ltda',
  tradeName: 'FisioFlow Clínica',
  cnpj: '12.345.678/0001-90',
  contact: {
    email: 'contato@fisioflow.com',
    phone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    website: 'www.fisioflow.com',
  },
  address: {
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Sala 101',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
  },
  schedule: {
    monday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    tuesday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    wednesday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    thursday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    friday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    saturday: { enabled: true, start: '08:00', end: '14:00' },
    sunday: { enabled: false, start: '08:00', end: '14:00' },
  },
  paymentMethods: [
    { id: '1', name: 'Dinheiro', type: 'cash', enabled: true },
    { id: '2', name: 'Cartão de Crédito', type: 'credit_card', enabled: true, installments: 12 },
    { id: '3', name: 'Cartão de Débito', type: 'debit_card', enabled: true },
    { id: '4', name: 'PIX', type: 'pix', enabled: true },
    { id: '5', name: 'Transferência Bancária', type: 'bank_transfer', enabled: true },
  ],
  integrations: [
    { id: '1', name: 'Google Calendar', description: 'Sincronizar agenda com Google Calendar', connected: false },
    { id: '2', name: 'WhatsApp Business', description: 'Envio automático de mensagens', connected: true },
    { id: '3', name: 'iFood', description: 'Pedidos e delivery (parceria)', connected: false },
    { id: '4', name: 'Asaas', description: 'Gestão de boletos e cobranças', connected: false },
    { id: '5', name: 'RD Station', description: 'Marketing e automação', connected: false },
    { id: '6', name: 'TOTVS', description: 'Integração contábil', connected: false },
  ],
};

// GET /api/settings/clinic - Get clinic settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const cacheKey = `clinic-settings:${category || 'full'}`;

    const settings = await withCache(
      cacheKey,
      async () => {
        // If requesting specific category, return key-value pairs
        if (category) {
          const result = await db.query.clinicSettings.findMany({
            where: eq(clinicSettings.category, category),
          });
          const settingsObj: Record<string, any> = {};
          result.forEach((s) => {
            settingsObj[s.key] = s.value;
          });
          return settingsObj;
        }

        // Otherwise return full clinic structure
        const clinicData = await db.query.clinicSettings.findFirst({
          where: eq(clinicSettings.key, 'clinic_data'),
        });

        if (clinicData?.value) {
          return clinicData.value;
        }

        // Return default if no settings found
        return DEFAULT_CLINIC;
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

// PUT /api/settings/clinic - Update full clinic data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if we have clinic_data record
    const existing = await db.query.clinicSettings.findFirst({
      where: eq(clinicSettings.key, 'clinic_data'),
    });

    if (existing) {
      await db.update(clinicSettings)
        .set({ value: body, updatedAt: new Date() })
        .where(eq(clinicSettings.key, 'clinic_data'));
    } else {
      await db.insert(clinicSettings).values({
        key: 'clinic_data',
        value: body,
        description: 'Full clinic configuration data',
        category: 'general',
      });
    }

    // Invalidate cache
    await invalidatePattern('clinic-settings:*');

    return NextResponse.json(body);
  } catch (error) {
    console.error('Error updating clinic settings:', error);
    return NextResponse.json(
      { error: 'Failed to update clinic settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/clinic - Update specific settings (legacy)
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
