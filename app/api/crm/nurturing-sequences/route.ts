import { NextRequest, NextResponse } from 'next/server';

// GET /api/crm/nurturing-sequences - Get nurturing sequences
export async function GET() {
  try {
    // TODO: Implement actual nurturing sequences retrieval from database
    const sequences = [
      {
        id: '1',
        name: 'Boas-vindas - Novos Leads',
        active: true,
        triggers: ['new_lead'],
        steps: [
          { delay: 0, type: 'email', subject: 'Bem-vindo à FisioFlow!' },
          { delay: 1, type: 'whatsapp', message: 'Olá! Como podemos ajudar?' },
          { delay: 3, type: 'email', subject: 'Agende sua avaliação' },
          { delay: 7, type: 'email', subject: 'Ainda está interessado?' },
        ],
      },
      {
        id: '2',
        name: 'Reativação - Pacientes Inativos',
        active: true,
        triggers: ['inactive_30_days'],
        steps: [
          { delay: 0, type: 'email', subject: 'Sentimos sua falta...' },
          { delay: 2, type: 'whatsapp', message: 'Queremos ver você de volta!' },
          { delay: 5, type: 'email', subject: 'Oferta especial de retorno' },
        ],
      },
      {
        id: '3',
        name: 'Pós-consulta - Follow-up',
        active: true,
        triggers: ['after_appointment'],
        steps: [
          { delay: 1, type: 'whatsapp', message: 'Como está se sentindo?' },
          { delay: 3, type: 'email', subject: 'Exercícios para casa' },
          { delay: 7, type: 'email', subject: 'Lembrete de próxima consulta' },
        ],
      },
    ];

    return NextResponse.json(sequences);
  } catch (error) {
    console.error('Error fetching nurturing sequences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nurturing sequences' },
      { status: 500 }
    );
  }
}

// POST /api/crm/nurturing-sequences - Create a new nurturing sequence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, active, triggers, steps } = body;

    if (!name || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'name and steps are required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual nurturing sequence creation in database
    const newSequence = {
      id: Date.now().toString(),
      name,
      active: active ?? true,
      triggers: triggers ?? [],
      steps,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newSequence, { status: 201 });
  } catch (error) {
    console.error('Error creating nurturing sequence:', error);
    return NextResponse.json(
      { error: 'Failed to create nurturing sequence' },
      { status: 500 }
    );
  }
}
