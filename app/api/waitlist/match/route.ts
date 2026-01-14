import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist, appointments, patients } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { sendWaitlistNotification, isWhatsAppAvailable } from '@/lib/whatsapp';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MatchResult {
  waitlistEntry: any;
  score: number;
  reasons: string[];
}

// POST /api/waitlist/match - Find matching waitlist entries for an available slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, therapistId, notifyPatients } = body;

    if (!date || !time) {
      return NextResponse.json(
        { error: 'date and time are required' },
        { status: 400 }
      );
    }

    const slotDate = new Date(date);
    const slotTime = time; // e.g., "14:00"

    // Find active waitlist entries that could match this slot
    const activeEntries = await db.query.waitlist.findMany({
      where: eq(waitlist.status, 'active'),
      with: {
        patient: true,
      },
    });

    // Score and rank matches
    const matches: MatchResult[] = [];

    for (const entry of activeEntries) {
      let score = 0;
      const reasons: string[] = [];

      // Check date preference
      if (entry.preferredDate) {
        const prefDate = new Date(entry.preferredDate);
        const daysDiff = Math.abs(
          (slotDate.getTime() - prefDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          score += 50;
          reasons.push('Data exata solicitada');
        } else if (daysDiff <= 1) {
          score += 40;
          reasons.push('Data próxima da preferida');
        } else if (daysDiff <= 3) {
          score += 25;
          reasons.push('Data dentro de 3 dias da preferida');
        } else if (daysDiff <= 7) {
          score += 10;
          reasons.push('Data dentro de uma semana');
        }
      } else {
        score += 20; // Flexible on date
        reasons.push('Flexível quanto à data');
      }

      // Check time preference
      if (entry.preferredTime) {
        const prefHour = parseInt(entry.preferredTime.split(':')[0]);
        const slotHour = parseInt(slotTime.split(':')[0]);
        const hoursDiff = Math.abs(prefHour - slotHour);

        if (hoursDiff === 0) {
          score += 30;
          reasons.push('Horário exato solicitado');
        } else if (hoursDiff <= 1) {
          score += 20;
          reasons.push('Horário próximo do preferido');
        } else if (hoursDiff <= 2) {
          score += 10;
          reasons.push('Horário aceitável');
        }
      } else {
        score += 15; // Flexible on time
        reasons.push('Flexível quanto ao horário');
      }

      // Bonus for longer wait time
      const waitDays = Math.floor(
        (Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (waitDays >= 7) {
        score += 15;
        reasons.push(`Na fila há ${waitDays} dias`);
      } else if (waitDays >= 3) {
        score += 10;
        reasons.push(`Na fila há ${waitDays} dias`);
      }

      // Bonus for having phone (can be notified)
      if (entry.phone || entry.patient?.phone) {
        score += 5;
        reasons.push('Pode ser notificado');
      }

      if (score > 0) {
        matches.push({
          waitlistEntry: {
            ...entry,
            patientPhone: entry.phone || entry.patient?.phone,
          },
          score,
          reasons,
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Take top matches (max 5)
    const topMatches = matches.slice(0, 5);

    // Optionally notify patients
    const notifications: any[] = [];
    if (notifyPatients && isWhatsAppAvailable()) {
      const formattedDate = format(slotDate, "dd 'de' MMMM", { locale: ptBR });
      
      for (const match of topMatches) {
        const phone = match.waitlistEntry.patientPhone;
        if (phone) {
          const success = await sendWaitlistNotification(
            match.waitlistEntry.patientName,
            phone,
            formattedDate,
            slotTime
          );

          notifications.push({
            entryId: match.waitlistEntry.id,
            patientName: match.waitlistEntry.patientName,
            sent: success,
          });

          // Small delay between notifications
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    return NextResponse.json({
      slot: {
        date: slotDate.toISOString(),
        time: slotTime,
        therapistId,
      },
      matches: topMatches,
      totalActive: activeEntries.length,
      notifications: notifications.length > 0 ? notifications : undefined,
    });
  } catch (error) {
    console.error('Error matching waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to match waitlist entries' },
      { status: 500 }
    );
  }
}

// GET /api/waitlist/match - Check for cancelled appointments and find matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const now = new Date();
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Find recently cancelled appointments that created open slots
    const cancelledAppointments = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        therapistId: appointments.therapistId,
        updatedAt: appointments.updatedAt,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.status, 'cancelled'),
          gte(appointments.startTime, now),
          lte(appointments.startTime, endDate),
          // Recently cancelled (last 24 hours)
          gte(appointments.updatedAt, new Date(now.getTime() - 24 * 60 * 60 * 1000))
        )
      );

    // Find active waitlist count
    const activeWaitlist = await db.query.waitlist.findMany({
      where: eq(waitlist.status, 'active'),
    });

    // Potential matches summary
    const potentialMatches = cancelledAppointments.map(apt => ({
      appointmentId: apt.id,
      date: apt.startTime,
      time: format(new Date(apt.startTime), 'HH:mm'),
      potentialMatchCount: activeWaitlist.filter(w => {
        if (!w.preferredDate) return true;
        const prefDate = new Date(w.preferredDate);
        const aptDate = new Date(apt.startTime);
        return Math.abs(prefDate.getTime() - aptDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
      }).length,
    }));

    return NextResponse.json({
      openSlots: cancelledAppointments.length,
      activeWaitlistCount: activeWaitlist.length,
      potentialMatches,
    });
  } catch (error) {
    console.error('Error checking waitlist matches:', error);
    return NextResponse.json(
      { error: 'Failed to check waitlist matches' },
      { status: 500 }
    );
  }
}
