import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentReminder, isWhatsAppAvailable } from '@/lib/whatsapp';

// POST /api/whatsapp/send-appointment-reminder - Send appointment reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientName || !body.patientPhone || !body.appointmentDate || !body.appointmentTime) {
      return NextResponse.json(
        { error: 'patientName, patientPhone, appointmentDate, and appointmentTime are required' },
        { status: 400 }
      );
    }

    // Check if WhatsApp is configured
    if (!isWhatsAppAvailable()) {
      return NextResponse.json(
        { error: 'WhatsApp integration is not configured' },
        { status: 503 }
      );
    }

    const appointmentDate = new Date(body.appointmentDate);
    const success = await sendAppointmentReminder(
      body.patientName,
      body.patientPhone,
      appointmentDate,
      body.appointmentTime
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send appointment reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment reminder sent successfully',
    });
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send appointment reminder' },
      { status: 500 }
    );
  }
}
