import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { sendBirthdayMessage } from '@/lib/whatsapp';
import { format } from 'date-fns';

// POST /api/automations/birthdays - Process and send birthday messages
export async function POST(request: NextRequest) {
  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // JS months are 0-indexed
    const todayDay = today.getDate();

    // Find patients with birthdays today
    // Using raw SQL for date part extraction
    const patientsWithBirthday = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.isActive, true),
          sql`EXTRACT(MONTH FROM ${patients.birthDate}) = ${todayMonth}`,
          sql`EXTRACT(DAY FROM ${patients.birthDate}) = ${todayDay}`
        )
      );

    const results = {
      found: patientsWithBirthday.length,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const patient of patientsWithBirthday) {
      if (!patient.phone) {
        results.failed++;
        results.details.push({
          patientId: patient.id,
          name: patient.fullName,
          status: 'skipped',
          reason: 'No phone number',
        });
        continue;
      }

      const sent = await sendBirthdayMessage(
        patient.fullName || 'Paciente',
        patient.phone
      );

      if (sent) {
        results.sent++;
        results.details.push({
          patientId: patient.id,
          name: patient.fullName,
          phone: patient.phone,
          status: 'sent',
        });
      } else {
        results.failed++;
        results.details.push({
          patientId: patient.id,
          name: patient.fullName,
          phone: patient.phone,
          status: 'failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Birthday messages processed for ${format(today, 'dd/MM/yyyy')}`,
      ...results,
    });
  } catch (error) {
    console.error('Error processing birthday messages:', error);
    return NextResponse.json(
      { error: 'Failed to process birthday messages' },
      { status: 500 }
    );
  }
}

// GET /api/automations/birthdays - Get upcoming birthdays
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const today = new Date();
    
    // Get birthdays for the next X days
    const upcomingBirthdays = [];
    
    for (let i = 0; i <= days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      const month = checkDate.getMonth() + 1;
      const day = checkDate.getDate();

      const patientsOnDay = await db
        .select({
          id: patients.id,
          fullName: patients.fullName,
          phone: patients.phone,
          email: patients.email,
          birthDate: patients.birthDate,
        })
        .from(patients)
        .where(
          and(
            eq(patients.isActive, true),
            sql`EXTRACT(MONTH FROM ${patients.birthDate}) = ${month}`,
            sql`EXTRACT(DAY FROM ${patients.birthDate}) = ${day}`
          )
        );

      if (patientsOnDay.length > 0) {
        upcomingBirthdays.push({
          date: format(checkDate, 'yyyy-MM-dd'),
          dayOfWeek: format(checkDate, 'EEEE'),
          isToday: i === 0,
          patients: patientsOnDay.map(p => ({
            ...p,
            age: p.birthDate ? Math.floor((today.getTime() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          })),
        });
      }
    }

    return NextResponse.json({
      period: `Next ${days} days`,
      totalBirthdays: upcomingBirthdays.reduce((sum, day) => sum + day.patients.length, 0),
      upcomingBirthdays,
    });
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming birthdays' },
      { status: 500 }
    );
  }
}
