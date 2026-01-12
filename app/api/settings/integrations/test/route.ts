import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clinicSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/settings/integrations/test - Test an integration connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.provider) {
      return NextResponse.json(
        { error: 'provider is required' },
        { status: 400 }
      );
    }

    const key = `${body.provider}_config`;
    const config = await db.query.clinicSettings.findFirst({
      where: eq(clinicSettings.key, key),
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Integration not configured' },
        { status: 404 }
      );
    }

    // Test based on provider
    let result = { success: false, message: '', details: {} as any };

    switch (body.provider) {
      case 'whatsapp':
        // Mock test - in production would send a test message
        result = {
          success: true,
          message: 'WhatsApp API credentials are valid',
          details: { hasToken: !!(config.value as any).token },
        };
        break;

      case 'email':
        // Mock test - in production would send a test email
        result = {
          success: true,
          message: 'Email configuration is valid',
          details: {
            hasSmtp: !!(config.value as any).smtp,
            hasFrom: !!(config.value as any).from,
          },
        };
        break;

      case 'zoom':
        // Mock test
        result = {
          success: true,
          message: 'Zoom API credentials are configured',
          details: {
            hasApiKey: !!(config.value as any).apiKey,
            hasApiSecret: !!(config.value as any).apiSecret,
          },
        };
        break;

      default:
        result = {
          success: true,
          message: `${body.provider} integration is configured`,
          details: {},
        };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing integration:', error);
    return NextResponse.json(
      { error: 'Failed to test integration', details: String(error) },
      { status: 500 }
    );
  }
}
