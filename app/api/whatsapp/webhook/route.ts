import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Types for Evolution API Webhook Events
interface EvolutionWebhookEvent {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageTimestamp?: number;
    status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  };
}

// Webhook events from Evolution API:
// - messages.upsert: New message received
// - messages.update: Message status updated
// - connection.update: Connection state changed
// - send.message: Message sent confirmation

// POST /api/whatsapp/webhook - Receive webhook events from Evolution API
export async function POST(request: NextRequest) {
  try {
    const body: EvolutionWebhookEvent = await request.json();
    
    console.log('[WhatsApp Webhook] Received event:', body.event, body.data?.key?.remoteJid);

    switch (body.event) {
      case 'messages.upsert':
        await handleNewMessage(body);
        break;
      
      case 'messages.update':
        await handleMessageUpdate(body);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(body);
        break;
      
      default:
        console.log('[WhatsApp Webhook] Unhandled event type:', body.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle incoming messages
async function handleNewMessage(event: EvolutionWebhookEvent) {
  const { data } = event;
  
  // Skip messages sent by us
  if (data.key.fromMe) return;

  const phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
  const messageText = data.message?.conversation || data.message?.extendedTextMessage?.text || '';
  const senderName = data.pushName || 'Desconhecido';

  console.log(`[WhatsApp] New message from ${senderName} (${phoneNumber}): ${messageText}`);

  // Check if this is a new lead
  try {
    const existingLeads = await db.query.leads.findMany({
      where: eq(leads.phone, phoneNumber),
    });

    if (existingLeads.length === 0) {
      // Create new lead from WhatsApp message
      await db.insert(leads).values({
        name: senderName,
        phone: phoneNumber,
        source: 'whatsapp',
        status: 'new',
        notes: `Primeira mensagem: "${messageText}"`,
      });

      console.log(`[WhatsApp] New lead created from WhatsApp: ${senderName}`);
    }
  } catch (dbError) {
    console.error('[WhatsApp] Error handling new message in DB:', dbError);
  }
}

// Handle message status updates (delivered, read, etc.)
async function handleMessageUpdate(event: EvolutionWebhookEvent) {
  const { data } = event;
  const status = data.status;
  const messageId = data.key.id;

  console.log(`[WhatsApp] Message ${messageId} status updated to: ${status}`);
  
  // Could update message status in database if tracking
}

// Handle connection state changes
async function handleConnectionUpdate(event: EvolutionWebhookEvent) {
  console.log('[WhatsApp] Connection state updated:', event.data);
  
  // Could store connection state or notify admins
}

// GET - Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WhatsApp webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
