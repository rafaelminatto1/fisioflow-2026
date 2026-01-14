import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';
import { sendBulkMessages } from '@/lib/whatsapp';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/campaigns/[id]/send - Send a campaign immediately
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get the campaign
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Only allow sending draft or scheduled campaigns
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return NextResponse.json(
        { error: `Cannot send a campaign with status: ${campaign.status}` },
        { status: 400 }
      );
    }

    // Validate recipients
    const recipients = campaign.recipients as Array<{ id: string; name?: string; phone?: string; email?: string }> || [];
    
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'Campaign has no recipients' },
        { status: 400 }
      );
    }

    // Update status to sending
    await db.update(campaigns)
      .set({ 
        status: 'sending',
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id));

    let deliveredCount = 0;
    let failedCount = 0;

    // Send based on campaign type
    if (campaign.type === 'whatsapp') {
      // Filter recipients with valid phone numbers
      const whatsappRecipients = recipients
        .filter(r => r.phone)
        .map(r => ({ phone: r.phone!, name: r.name || 'Cliente' }));

      if (whatsappRecipients.length === 0) {
        await db.update(campaigns)
          .set({ 
            status: 'draft',
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, id));

        return NextResponse.json(
          { error: 'No recipients with valid phone numbers' },
          { status: 400 }
        );
      }

      const results = await sendBulkMessages(
        whatsappRecipients,
        campaign.message,
        2000 // 2 second delay between messages
      );

      deliveredCount = results.success;
      failedCount = results.failed;

    } else if (campaign.type === 'email') {
      // Email sending would be implemented here
      // For now, simulate success
      const emailRecipients = recipients.filter(r => r.email);
      deliveredCount = emailRecipients.length;
      failedCount = recipients.length - emailRecipients.length;
      
      console.log(`[EMAIL CAMPAIGN] Would send "${campaign.name}" to ${emailRecipients.length} recipients`);
      
    } else if (campaign.type === 'sms') {
      // SMS sending would be implemented here
      const smsRecipients = recipients.filter(r => r.phone);
      deliveredCount = smsRecipients.length;
      failedCount = recipients.length - smsRecipients.length;
      
      console.log(`[SMS CAMPAIGN] Would send "${campaign.name}" to ${smsRecipients.length} recipients`);
    }

    // Update campaign with results
    const updated = await db.update(campaigns)
      .set({
        status: 'sent',
        sentAt: new Date(),
        deliveredCount,
        failedCount,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    // Invalidate cache
    await invalidatePattern('campaigns:*');

    return NextResponse.json({
      success: true,
      message: 'Campaign sent successfully',
      campaign: updated[0],
      stats: {
        totalRecipients: recipients.length,
        delivered: deliveredCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error('Error sending campaign:', error);

    // Revert status on error
    const { id } = await context.params;
    await db.update(campaigns)
      .set({ 
        status: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id));

    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
