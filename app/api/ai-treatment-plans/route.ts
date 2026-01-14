import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiTreatmentPlans, patients, patientSessions, exercises } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

// GET /api/ai-treatment-plans - List AI treatment plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const isAccepted = searchParams.get('accepted');
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = `ai-treatment-plans:${patientId || 'all'}:${isAccepted || 'all'}:${limit}`;

    const plans = await withCache(
      cacheKey,
      async () => {
        return await db.query.aiTreatmentPlans.findMany({
          where: patientId ? eq(aiTreatmentPlans.patientId, patientId) : undefined,
          with: {
            patient: true,
            createdByStaff: true,
          },
          orderBy: [desc(aiTreatmentPlans.createdAt)],
          limit,
        });
      },
      { ttl: 120 }
    );

    // Apply filters
    let filtered = plans;

    if (isAccepted !== null) {
      filtered = filtered.filter(p => p.isAccepted === (isAccepted === 'true'));
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching AI treatment plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI treatment plans' },
      { status: 500 }
    );
  }
}

// POST /api/ai-treatment-plans - Create a new AI treatment plan (or generate with AI)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, body.patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    let diagnosis = body.diagnosis;
    let techniques = body.techniques || [];
    let objectives = body.objectives || [];
    let exercisesList = body.exercises || [];
    let expectedOutcomes = body.expectedOutcomes || [];
    let precautions = body.precautions || [];
    let aiResponse = null;

    // If generateWithAI is true, call AI to generate the plan
    if (body.generateWithAI) {
      // Get patient history for context
      const patientSessions = await db.query.patientSessions.findMany({
        where: eq(patients.id, body.patientId),
        orderBy: [desc(aiTreatmentPlans.createdAt)],
        limit: 10,
      });

      const availableExercises = await db.query.exercises.findMany({ limit: 50 });

      // Prepare AI prompt context
      const patientContext = {
        name: patient.fullName,
        condition: patient.condition,
        profession: patient.profession,
        recentSessions: patientSessions.map(s => ({
          date: s.date,
          assessment: s.assessment,
          plan: s.plan,
          evaScore: s.evaScore,
        })),
      };

      // In a real implementation, this would call an AI service like OpenAI or Google Gemini
      // For now, we'll generate a sample plan based on the patient's condition
      const aiGeneratedPlan = generateSampleAIPlan(patientContext, availableExercises);
      
      diagnosis = aiGeneratedPlan.diagnosis;
      techniques = aiGeneratedPlan.techniques;
      objectives = aiGeneratedPlan.objectives;
      exercisesList = aiGeneratedPlan.exercises;
      expectedOutcomes = aiGeneratedPlan.expectedOutcomes;
      precautions = aiGeneratedPlan.precautions;
      aiResponse = aiGeneratedPlan;
    }

    // Create the treatment plan
    const newPlan = await db.insert(aiTreatmentPlans).values({
      patientId: body.patientId,
      sessionId: body.sessionId || null,
      diagnosis: diagnosis || 'Diagnóstico não especificado',
      objectives: objectives,
      techniques: techniques,
      exercises: exercisesList,
      expectedOutcomes: expectedOutcomes,
      precautions: precautions,
      aiModel: body.generateWithAI ? 'fisioflow-sample' : null,
      aiResponse: aiResponse,
      isAccepted: false,
      modifications: null,
      createdBy: body.createdBy || null,
    }).returning();

    // Invalidate cache
    await invalidatePattern('ai-treatment-plans:*');

    return NextResponse.json(newPlan[0], { status: 201 });
  } catch (error) {
    console.error('Error creating AI treatment plan:', error);
    return NextResponse.json(
      { error: 'Failed to create AI treatment plan' },
      { status: 500 }
    );
  }
}

// Helper function to generate a sample AI plan
function generateSampleAIPlan(patientContext: any, exercises: any[]) {
  const condition = patientContext.condition?.toLowerCase() || '';
  
  // Default plan structure
  let plan = {
    diagnosis: `Avaliação fisioterapêutica para ${patientContext.condition || 'condição musculoesquelética'}`,
    techniques: [] as any[],
    objectives: [] as any[],
    exercises: [] as any[],
    expectedOutcomes: [] as any[],
    precautions: [] as string[],
  };

  // Customize based on common conditions
  if (condition.includes('lombalgia') || condition.includes('dor lombar') || condition.includes('coluna')) {
    plan = {
      diagnosis: 'Lombalgia mecânica com possível componente postural',
      techniques: [
        { name: 'Liberação miofascial', description: 'Técnica de liberação dos músculos paravertebrais e quadrado lombar', duration: 15, frequency: '2x/semana' },
        { name: 'Mobilização articular', description: 'Mobilização da coluna lombar em flexão e extensão', duration: 10, frequency: '2x/semana' },
        { name: 'Fortalecimento do core', description: 'Exercícios de estabilização lombo-pélvica', duration: 20, frequency: '3x/semana' },
      ],
      objectives: [
        { title: 'Redução da dor', description: 'Reduzir a intensidade da dor de EVA atual para EVA 2 ou menos', targetDate: '4 semanas' },
        { title: 'Melhora funcional', description: 'Retomar atividades diárias sem limitação', targetDate: '6 semanas' },
        { title: 'Fortalecimento', description: 'Aumentar força e resistência da musculatura do core', targetDate: '8 semanas' },
      ],
      exercises: [
        { name: 'Prancha abdominal', sets: 3, reps: '30 segundos', frequency: 'Diário', notes: 'Manter alinhamento neutro da coluna' },
        { name: 'Ponte', sets: 3, reps: '15 repetições', frequency: 'Diário', notes: 'Ativar glúteos ao subir' },
        { name: 'Cat-Cow', sets: 2, reps: '10 repetições', frequency: 'Diário', notes: 'Movimentos lentos e controlados' },
        { name: 'Bird-Dog', sets: 2, reps: '10 de cada lado', frequency: 'Diário', notes: 'Manter estabilidade do tronco' },
      ],
      expectedOutcomes: [
        { outcome: 'Redução de 50% na escala de dor', timeframe: '2 semanas' },
        { outcome: 'Capacidade de sentar por 1 hora sem desconforto', timeframe: '4 semanas' },
        { outcome: 'Retorno às atividades físicas leves', timeframe: '6 semanas' },
      ],
      precautions: [
        'Evitar movimentos de flexão e rotação simultânea',
        'Não permanecer sentado por mais de 40 minutos sem pausas',
        'Evitar carregar peso acima de 5kg nas primeiras 2 semanas',
      ],
    };
  } else if (condition.includes('ombro') || condition.includes('manguito') || condition.includes('tendinite')) {
    plan = {
      diagnosis: 'Síndrome do impacto do ombro / Tendinopatia do manguito rotador',
      techniques: [
        { name: 'Terapia manual', description: 'Mobilização da articulação glenoumeral e escapulotorácica', duration: 15, frequency: '2x/semana' },
        { name: 'Crioterapia', description: 'Aplicação de gelo pós-exercícios', duration: 10, frequency: 'Após cada sessão' },
        { name: 'Fortalecimento progressivo', description: 'Exercícios com resistência progressiva para manguito rotador', duration: 20, frequency: '3x/semana' },
      ],
      objectives: [
        { title: 'Controle da inflamação', description: 'Reduzir sinais inflamatórios na região do ombro', targetDate: '2 semanas' },
        { title: 'Recuperação da ADM', description: 'Recuperar amplitude de movimento completa', targetDate: '6 semanas' },
        { title: 'Fortalecimento', description: 'Fortalecer musculatura estabilizadora do ombro', targetDate: '12 semanas' },
      ],
      exercises: [
        { name: 'Rotação externa com faixa', sets: 3, reps: '15 repetições', frequency: 'Diário', notes: 'Cotovelo junto ao corpo' },
        { name: 'Pendular de Codman', sets: 3, reps: '30 segundos cada direção', frequency: 'Diário', notes: 'Relaxar o braço completamente' },
        { name: 'Flexão de ombro na parede', sets: 2, reps: '10 repetições', frequency: 'Diário', notes: 'Subir até onde não causar dor' },
      ],
      expectedOutcomes: [
        { outcome: 'Redução significativa da dor em repouso', timeframe: '2 semanas' },
        { outcome: 'Capacidade de elevar o braço acima da cabeça', timeframe: '6 semanas' },
        { outcome: 'Retorno às atividades funcionais sem dor', timeframe: '12 semanas' },
      ],
      precautions: [
        'Evitar movimentos acima da cabeça nas primeiras 2 semanas',
        'Não dormir sobre o ombro afetado',
        'Interromper exercício se houver dor aguda',
      ],
    };
  } else {
    // Generic plan
    plan = {
      diagnosis: `Avaliação fisioterapêutica - ${patientContext.condition || 'Condição musculoesquelética geral'}`,
      techniques: [
        { name: 'Avaliação funcional', description: 'Avaliação completa de padrões de movimento', duration: 30, frequency: 'Inicial' },
        { name: 'Exercícios terapêuticos', description: 'Programa de exercícios personalizado', duration: 40, frequency: '2-3x/semana' },
        { name: 'Educação do paciente', description: 'Orientações sobre autocuidado e prevenção', duration: 15, frequency: 'Contínuo' },
      ],
      objectives: [
        { title: 'Avaliação', description: 'Identificar as causas principais da condição', targetDate: '1 semana' },
        { title: 'Alívio sintomático', description: 'Reduzir sintomas principais', targetDate: '2-4 semanas' },
        { title: 'Reabilitação funcional', description: 'Recuperar funcionalidade completa', targetDate: '8-12 semanas' },
      ],
      exercises: exercises.slice(0, 4).map(ex => ({
        exerciseId: ex.id,
        name: ex.title,
        sets: 3,
        reps: '10-15 repetições',
        frequency: '3x/semana',
        notes: ex.description,
      })),
      expectedOutcomes: [
        { outcome: 'Melhora subjetiva dos sintomas', timeframe: '2 semanas' },
        { outcome: 'Aumento da funcionalidade', timeframe: '4 semanas' },
        { outcome: 'Alta com programa de manutenção', timeframe: '8-12 semanas' },
      ],
      precautions: [
        'Respeitar os limites de dor durante os exercícios',
        'Comunicar qualquer sintoma novo ou agravamento',
        'Manter boa hidratação e descanso adequado',
      ],
    };
  }

  return plan;
}
