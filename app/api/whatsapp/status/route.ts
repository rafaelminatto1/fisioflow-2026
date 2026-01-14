import { NextResponse } from 'next/server';
import { isWhatsAppAvailable } from '@/lib/whatsapp';

interface EvolutionInstanceStatus {
  instance: {
    instanceName: string;
    state: 'open' | 'close' | 'connecting';
  };
}

// GET /api/whatsapp/status - Get WhatsApp connection status
export async function GET() {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'fisioflow';

    if (!apiUrl || !apiKey) {
      return NextResponse.json({
        connected: false,
        configured: false,
        message: 'WhatsApp integration is not configured',
        details: {
          hasApiUrl: !!apiUrl,
          hasApiKey: !!apiKey,
        }
      });
    }

    // Try to get instance status from Evolution API
    try {
      const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
        headers: {
          'apikey': apiKey,
        },
      });

      if (response.ok) {
        const data: EvolutionInstanceStatus = await response.json();
        return NextResponse.json({
          connected: data.instance?.state === 'open',
          configured: true,
          state: data.instance?.state || 'unknown',
          instanceName: instanceName,
          message: data.instance?.state === 'open' 
            ? 'WhatsApp conectado e funcionando' 
            : 'WhatsApp não está conectado',
        });
      }
    } catch (fetchError) {
      console.error('Error checking Evolution API status:', fetchError);
    }

    // Fallback response if we can't reach the API
    return NextResponse.json({
      connected: false,
      configured: isWhatsAppAvailable(),
      state: 'unknown',
      message: 'Não foi possível verificar o status da conexão',
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json(
      { 
        connected: false,
        configured: false,
        error: 'Failed to get WhatsApp status' 
      },
      { status: 500 }
    );
  }
}
