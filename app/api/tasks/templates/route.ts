import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks/templates - Get task templates
export async function GET() {
  try {
    // TODO: Implement actual task templates retrieval from database
    const templates = [
      {
        id: '1',
        name: 'Ligar para paciente novo',
        description: 'Ligar para realizar cadastro completo',
        priority: 'high',
        estimatedDuration: 15,
        checklist: [
          'Verificar se recebeu formulário de cadastro',
          'Confirmar dados de contato',
          'Agendar primeira avaliação',
        ],
      },
      {
        id: '2',
        name: 'Preparar sessão de avaliação',
        description: 'Preparar materiais para avaliação inicial',
        priority: 'medium',
        estimatedDuration: 10,
        checklist: [
          'Imprimir formulários de anamnese',
          'Preparar goniômetro e fita métrica',
          'Verificar disponibilidade de sala',
        ],
      },
      {
        id: '3',
        name: 'Follow-up pós-consulta',
        description: 'Entrar em contato após sessão',
        priority: 'low',
        estimatedDuration: 5,
        checklist: [
          'Enviar exercícios por WhatsApp',
          'Agendar próxima sessão',
        ],
      },
      {
        id: '4',
        name: 'Contatar lead frio',
        description: 'Tentar reativar lead sem resposta',
        priority: 'low',
        estimatedDuration: 10,
        checklist: [
          'Verificar histórico de interações',
          'Preparar oferta especial',
          'Registrar tentativa de contato',
        ],
      },
    ];

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task templates' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/templates - Create a new task template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, priority, estimatedDuration, checklist } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual task template creation in database
    const newTemplate = {
      id: Date.now().toString(),
      name,
      description: description ?? '',
      priority: priority ?? 'medium',
      estimatedDuration: estimatedDuration ?? 15,
      checklist: checklist ?? [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating task template:', error);
    return NextResponse.json(
      { error: 'Failed to create task template' },
      { status: 500 }
    );
  }
}
