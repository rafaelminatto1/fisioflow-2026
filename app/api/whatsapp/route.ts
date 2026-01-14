import { NextRequest, NextResponse } from 'next/server';
import { 
  sendWhatsAppMessage, 
  sendWelcomeMessage, 
  sendSessionSummary,
  sendAppointmentReminder,
  isWhatsAppAvailable 
} from '@/lib/whatsapp';
import { db } from '@/lib/db';

// POST /api/whatsapp - Send various types of WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Check if WhatsApp is configured
    if (!isWhatsAppAvailable()) {
      return NextResponse.json(
        { 
          error: 'WhatsApp integration is not configured',
          message: 'Please set EVOLUTION_API_URL and EVOLUTION_API_KEY environment variables'
        },
        { status: 503 }
      );
    }

    let success = false;
    let resultMessage = '';

    switch (type) {
      case 'welcome':
        // Send welcome message to new patient
        if (!body.patientName || !body.patientPhone) {
          return NextResponse.json(
            { error: 'patientName and patientPhone are required for welcome message' },
            { status: 400 }
          );
        }
        success = await sendWelcomeMessage(body.patientName, body.patientPhone);
        resultMessage = 'Welcome message sent';
        break;

      case 'session_summary':
        // Send session summary after appointment
        if (!body.patientName || !body.patientPhone || !body.summary) {
          return NextResponse.json(
            { error: 'patientName, patientPhone, and summary are required for session summary' },
            { status: 400 }
          );
        }
        success = await sendSessionSummary(body.patientName, body.patientPhone, body.summary);
        resultMessage = 'Session summary sent';
        break;

      case 'appointment_reminder':
        // Send appointment reminder
        if (!body.patientName || !body.patientPhone || !body.appointmentDate || !body.appointmentTime) {
          return NextResponse.json(
            { error: 'patientName, patientPhone, appointmentDate, and appointmentTime are required' },
            { status: 400 }
          );
        }
        success = await sendAppointmentReminder(
          body.patientName, 
          body.patientPhone, 
          new Date(body.appointmentDate),
          body.appointmentTime
        );
        resultMessage = 'Appointment reminder sent';
        break;

      case 'custom':
        // Send custom message
        if (!body.phone || !body.message) {
          return NextResponse.json(
            { error: 'phone and message are required for custom message' },
            { status: 400 }
          );
        }
        const result = await sendWhatsAppMessage({
          number: body.phone,
          text: body.message,
        });
        success = result !== null;
        resultMessage = 'Custom message sent';
        break;

      case 'birthday':
        // Send birthday message
        if (!body.patientName || !body.patientPhone) {
          return NextResponse.json(
            { error: 'patientName and patientPhone are required for birthday message' },
            { status: 400 }
          );
        }
        const birthdayMsg = `🎂 Feliz Aniversário, ${body.patientName}! 🎉\n\nA equipe FisioFlow deseja um dia maravilhoso cheio de alegrias e realizações!\n\nUm grande abraço! 💪`;
        const birthdayResult = await sendWhatsAppMessage({
          number: body.patientPhone,
          text: birthdayMsg,
        });
        success = birthdayResult !== null;
        resultMessage = 'Birthday message sent';
        break;

      case 'no_show':
        // Send no-show follow-up message
        if (!body.patientName || !body.patientPhone) {
          return NextResponse.json(
            { error: 'patientName and patientPhone are required for no-show message' },
            { status: 400 }
          );
        }
        const noShowMsg = `Olá ${body.patientName}! 👋\n\nSentimos sua falta hoje na sessão agendada. Está tudo bem?\n\nSe precisar remarcar, estamos à disposição. É só responder esta mensagem!\n\nEquipe FisioFlow 💙`;
        const noShowResult = await sendWhatsAppMessage({
          number: body.patientPhone,
          text: noShowMsg,
        });
        success = noShowResult !== null;
        resultMessage = 'No-show follow-up sent';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid message type. Use: welcome, session_summary, appointment_reminder, custom, birthday, or no_show' },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultMessage,
      type: type,
    });
  } catch (error) {
    console.error('Error in WhatsApp API:', error);
    return NextResponse.json(
      { error: 'Failed to process WhatsApp request' },
      { status: 500 }
    );
  }
}

// GET /api/whatsapp - Get WhatsApp integration info
export async function GET() {
  const available = isWhatsAppAvailable();
  
  return NextResponse.json({
    available,
    configured: available,
    supportedTypes: [
      'welcome',
      'session_summary', 
      'appointment_reminder',
      'custom',
      'birthday',
      'no_show'
    ],
    endpoints: {
      send: '/api/whatsapp/send',
      status: '/api/whatsapp/status',
      webhook: '/api/whatsapp/webhook',
      reminder: '/api/whatsapp/send-appointment-reminder',
    }
  });
}
