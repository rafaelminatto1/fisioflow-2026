/**
 * Evolution API WhatsApp Integration
 * Handles sending WhatsApp messages through Evolution API
 */

interface WhatsAppMessage {
  number: string; // Phone number with country code (e.g., 5511999999999)
  text: string;
}

interface EvolutionAPIResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp?: number;
  status?: number;
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<EvolutionAPIResponse | null> {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
      console.warn('Evolution API not configured, skipping WhatsApp message');
      return null;
    }

    // Clean phone number - remove non-numeric characters
    const cleanNumber = message.number.replace(/\D/g, '');

    const response = await fetch(`${apiUrl}/message/sendText/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: message.text,
      }),
    });

    if (!response.ok) {
      console.error('WhatsApp API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return null;
  }
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
  patientName: string,
  patientPhone: string,
  appointmentDate: Date,
  appointmentTime: string
): Promise<boolean> {
  const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
  const message = `Olá ${patientName}! 👋\n\nLembrando do seu agendamento na FisioFlow:\n📅 Data: ${formattedDate}\n⏰ Horário: ${appointmentTime}\n\nAté logo! 💪`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send session SOAP note summary
 */
export async function sendSessionSummary(
  patientName: string,
  patientPhone: string,
  summary: string
): Promise<boolean> {
  const message = `Olá ${patientName}! 📝\n\nResumo da sua sessão de hoje:\n${summary}\n\nContinue com os exercícios em casa! 💪`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send welcome message to new patient
 */
export async function sendWelcomeMessage(
  patientName: string,
  patientPhone: string
): Promise<boolean> {
  const message = `Bem-vindo(a) à FisioFlow, ${patientName}! 🎉\n\nEstamos muito felizes em ter você conosco. Em breve entraremos em contato para agendar sua avaliação.\n\nQualquer dúvida, estamos à disposição! 💪`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Check if WhatsApp integration is available
 */
export function isWhatsAppAvailable(): boolean {
  return !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY);
}
