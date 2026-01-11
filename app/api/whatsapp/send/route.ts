import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, isWhatsAppAvailable } from '@/lib/whatsapp';

// POST /api/whatsapp/send - Send a WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.number || !body.text) {
      return NextResponse.json(
        { error: 'number and text are required' },
        { status: 400 }
      );
    }

    // Check if WhatsApp is configured
    if (!isWhatsAppAvailable()) {
      return NextResponse.json(
        { error: 'WhatsApp integration is not configured', message: 'Please set EVOLUTION_API_URL and EVOLUTION_API_KEY environment variables' },
        { status: 503 }
      );
    }

    const result = await sendWhatsAppMessage({
      number: body.number,
      text: body.text,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}

// GET /api/whatsapp/send - Check WhatsApp availability
export async function GET() {
  return NextResponse.json({
    available: isWhatsAppAvailable(),
    configured: isWhatsAppAvailable(),
  });
}
