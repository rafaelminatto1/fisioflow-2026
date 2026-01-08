'use server';

import { revalidatePath } from 'next/cache';

/**
 * Envia um lembrete de agendamento via WhatsApp usando a Evolution API.
 * 
 * @param appointmentId O ID do agendamento
 * @returns Objeto com status de sucesso e mensagem
 */
export async function sendAppointmentReminder(appointmentId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Simulação de busca no Banco de Dados
    // Em produção, isso seria uma consulta Drizzle: db.query.appointments.findFirst(...)
    // Adicionamos um pequeno delay para simular a latência do banco
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Dados mockados baseados no schema do projeto
    const appointmentData = {
      id: appointmentId,
      patientName: 'Ana Silva',
      patientPhone: '5511999991234', // Formato DDI+DDD+Numero exigido pela API
      physioName: 'Dr. Pedro',
      startTime: '14:00', // Horário formatado
    };

    // 2. Formatar a mensagem conforme o template do Requisito Funcional
    const message = `Olá ${appointmentData.patientName}, sua sessão é amanhã às ${appointmentData.startTime} com ${appointmentData.physioName}. Responda SIM para confirmar.`;

    // Configurações da API (Idealmente viriam de process.env)
    const apiUrl = process.env.EVOLUTION_API_URL || 'https://api.evolution-demo.com';
    const apiKey = process.env.EVOLUTION_API_KEY || 'my-secret-key';
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'fisioflow-main';

    // 3. Chamada Fetch para a Evolution API
    // Endpoint padrão v2 para envio de texto
    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: appointmentData.patientPhone,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: false
        },
        textMessage: {
          text: message
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erro na Evolution API: ${response.status} - ${errorBody}`);
      throw new Error('Falha na comunicação com o serviço de WhatsApp.');
    }

    // 4. Revalidação de Cache
    // Atualiza a agenda e o dashboard para refletir possíveis mudanças de status (ex: flag de lembrete enviado)
    revalidatePath('/agenda');
    revalidatePath('/'); 

    return { 
      success: true, 
      message: 'Lembrete de WhatsApp enviado com sucesso!' 
    };

  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido ao processar o envio.' 
    };
  }
}