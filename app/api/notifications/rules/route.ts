import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications/rules - Get notification rules
export async function GET() {
  try {
    // TODO: Implement actual rules retrieval when rules table is created
    const rules = [
      {
        id: '1',
        name: 'Lembrete de consulta',
        enabled: true,
        trigger: 'before_appointment',
        hoursBefore: 24,
      },
      {
        id: '2',
        name: 'Confirmação de agendamento',
        enabled: true,
        trigger: 'after_booking',
        delayMinutes: 5,
      },
      {
        id: '3',
        name: 'Follow-up pós-consulta',
        enabled: true,
        trigger: 'after_appointment',
        delayHours: 48,
      },
    ];

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching notification rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification rules' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/rules/[id] - Update a notification rule
// This is a placeholder - actual implementation would need dynamic routing
