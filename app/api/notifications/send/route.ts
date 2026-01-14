import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications, notificationPreferences, patients, staff, user } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';
import { sendWhatsAppMessage, isWhatsAppAvailable } from '@/lib/whatsapp';

type NotificationType = 
  | 'appointment_reminder' 
  | 'session_summary' 
  | 'payment_due' 
  | 'payment_received'
  | 'birthday'
  | 'achievement'
  | 'waitlist_match'
  | 'system'
  | 'marketing';

interface NotificationPayload {
  userId?: string;
  patientId?: string;
  userIds?: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: ('push' | 'email' | 'whatsapp' | 'sms')[];
}

// POST /api/notifications/send - Send notifications via multiple channels
export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();

    if ((!body.userId && !body.patientId && !body.userIds) || !body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'userId/patientId/userIds, type, title, and message are required' },
        { status: 400 }
      );
    }

    const results = {
      sent: 0,
      failed: 0,
      channels: {} as Record<string, { sent: boolean; error?: string }>,
    };

    // Determine target user(s)
    let targetUserIds: string[] = [];
    let targetPhone: string | null = null;
    let targetEmail: string | null = null;

    if (body.userIds) {
      targetUserIds = body.userIds;
    } else if (body.userId) {
      targetUserIds = [body.userId];
    } else if (body.patientId) {
      // Get patient info
      const patient = await db.query.patients.findFirst({
        where: eq(patients.id, body.patientId),
      });
      if (patient) {
        targetPhone = patient.phone;
        targetEmail = patient.email;
        // If patient is linked to a user, add to targets
        // For now, create notification without userId
      }
    }

    // Get user preferences and contact info
    let preferences: Record<string, boolean> = {
      push: true,
      email: true,
      whatsapp: false,
      sms: false,
    };

    if (targetUserIds.length === 1) {
      const userPrefs = await db.query.notificationPreferences.findMany({
        where: eq(notificationPreferences.userId, targetUserIds[0]),
      });

      userPrefs.forEach(p => {
        preferences[p.channel] = p.enabled;
      });
    }

    // Determine which channels to use
    const channels = body.channels || ['push'];

    // 1. Create in-app notification (push)
    if (channels.includes('push')) {
      try {
        for (const userId of targetUserIds) {
          await db.insert(notifications).values({
            userId,
            type: body.type,
            title: body.title,
            message: body.message,
            data: body.data || null,
            read: false,
          });
        }
        results.channels.push = { sent: true };
        results.sent++;
      } catch (e: any) {
        results.channels.push = { sent: false, error: e.message };
        results.failed++;
      }
    }

    // 2. Send WhatsApp if enabled
    if (channels.includes('whatsapp') && preferences.whatsapp && isWhatsAppAvailable()) {
      try {
        const phone = targetPhone || await getPhoneForUser(targetUserIds[0]);
        if (phone) {
          const result = await sendWhatsAppMessage({
            number: phone,
            text: `${body.title}\n\n${body.message}`,
          });
          results.channels.whatsapp = { sent: result !== null };
          if (result) results.sent++;
          else results.failed++;
        } else {
          results.channels.whatsapp = { sent: false, error: 'No phone number' };
        }
      } catch (e: any) {
        results.channels.whatsapp = { sent: false, error: e.message };
        results.failed++;
      }
    }

    // 3. Send Email if enabled (placeholder)
    if (channels.includes('email') && preferences.email) {
      try {
        const email = targetEmail || await getEmailForUser(targetUserIds[0]);
        if (email) {
          // TODO: Implement email sending (e.g., using Resend, SendGrid, etc.)
          console.log(`Would send email to ${email}: ${body.title}`);
          results.channels.email = { sent: true }; // Placeholder
          results.sent++;
        } else {
          results.channels.email = { sent: false, error: 'No email address' };
        }
      } catch (e: any) {
        results.channels.email = { sent: false, error: e.message };
        results.failed++;
      }
    }

    // 4. Send SMS if enabled (placeholder)
    if (channels.includes('sms') && preferences.sms) {
      try {
        const phone = targetPhone || await getPhoneForUser(targetUserIds[0]);
        if (phone) {
          // TODO: Implement SMS sending (e.g., using Twilio)
          console.log(`Would send SMS to ${phone}: ${body.title}`);
          results.channels.sms = { sent: true }; // Placeholder
          results.sent++;
        } else {
          results.channels.sms = { sent: false, error: 'No phone number' };
        }
      } catch (e: any) {
        results.channels.sms = { sent: false, error: e.message };
        results.failed++;
      }
    }

    // Invalidate cache
    for (const userId of targetUserIds) {
      await invalidatePattern(`notifications:${userId}:*`);
    }

    return NextResponse.json({
      success: results.sent > 0,
      ...results,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// Helper to get phone for a user
async function getPhoneForUser(userId: string): Promise<string | null> {
  // Try staff first
  const staffMember = await db.query.staff.findFirst({
    where: eq(staff.userId, userId),
  });
  if (staffMember?.phone) return staffMember.phone;

  // Try user table
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
  // User table might not have phone directly, check related records

  return null;
}

// Helper to get email for a user
async function getEmailForUser(userId: string): Promise<string | null> {
  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
  return userRecord?.email || null;
}
