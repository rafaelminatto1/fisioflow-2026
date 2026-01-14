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

/**
 * Send birthday message
 */
export async function sendBirthdayMessage(
  patientName: string,
  patientPhone: string
): Promise<boolean> {
  const message = `🎂 Feliz Aniversário, ${patientName}! 🎉\n\nA equipe FisioFlow deseja um dia maravilhoso cheio de alegrias e realizações!\n\nUm grande abraço! 💪`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send no-show follow-up message
 */
export async function sendNoShowMessage(
  patientName: string,
  patientPhone: string
): Promise<boolean> {
  const message = `Olá ${patientName}! 👋\n\nSentimos sua falta hoje na sessão agendada. Está tudo bem?\n\nSe precisar remarcar, estamos à disposição. É só responder esta mensagem!\n\nEquipe FisioFlow 💙`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send waitlist slot available notification
 */
export async function sendWaitlistNotification(
  patientName: string,
  patientPhone: string,
  availableDate: string,
  availableTime: string
): Promise<boolean> {
  const message = `Olá ${patientName}! 🎉\n\nUma vaga ficou disponível para você na FisioFlow!\n\n📅 Data: ${availableDate}\n⏰ Horário: ${availableTime}\n\nResponda SIM para confirmar ou NÃO se preferir esperar outra oportunidade.\n\nAguardamos sua resposta! 💪`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send payment confirmation
 */
export async function sendPaymentConfirmation(
  patientName: string,
  patientPhone: string,
  amount: number,
  description: string
): Promise<boolean> {
  const formattedAmount = (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const message = `Olá ${patientName}! ✅\n\nPagamento confirmado:\n💰 Valor: ${formattedAmount}\n📝 Ref: ${description}\n\nObrigado pela confiança! 💙\n\nEquipe FisioFlow`;

  const result = await sendWhatsAppMessage({
    number: patientPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send lead first contact message
 */
export async function sendLeadFirstContact(
  leadName: string,
  leadPhone: string,
  interest?: string
): Promise<boolean> {
  let message = `Olá ${leadName}! 👋\n\nRecebemos seu contato e ficamos muito felizes com seu interesse!\n\n`;
  
  if (interest) {
    message += `Entendemos que você busca tratamento para ${interest}.\n\n`;
  }
  
  message += `Gostaria de agendar uma avaliação gratuita? Podemos explicar como funcionam nossos tratamentos e tirar todas as suas dúvidas.\n\nResponda esta mensagem ou ligue para nós! 📞\n\nEquipe FisioFlow 💙`;

  const result = await sendWhatsAppMessage({
    number: leadPhone,
    text: message,
  });

  return result !== null;
}

/**
 * Send bulk messages (for campaigns)
 */
export async function sendBulkMessages(
  recipients: Array<{ phone: string; name: string }>,
  messageTemplate: string,
  delayMs: number = 2000 // Default 2 seconds between messages to avoid rate limiting
): Promise<{ success: number; failed: number; results: Array<{ phone: string; success: boolean }> }> {
  const results: Array<{ phone: string; success: boolean }> = [];
  let success = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // Replace template variables
    const personalizedMessage = messageTemplate.replace(/\{nome\}/g, recipient.name);
    
    const result = await sendWhatsAppMessage({
      number: recipient.phone,
      text: personalizedMessage,
    });

    const isSuccess = result !== null;
    results.push({ phone: recipient.phone, success: isSuccess });
    
    if (isSuccess) {
      success++;
    } else {
      failed++;
    }

    // Add delay between messages
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { success, failed, results };
}
