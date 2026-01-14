import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientSessions } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

interface PainPoint {
  id: string;
  x: number;
  y: number;
  angle: number;
  intensity: number;
  type: string;
  muscleGroup?: string;
  notes?: string;
  agravantes?: string[];
  aliviantes?: string[];
}

interface PainMapData {
  points: PainPoint[];
  imageUrl?: string;
  bodyPart?: string;
}

// GET /api/pain-maps/compare - Compare pain maps between two sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const sessionId1 = searchParams.get('session1');
    const sessionId2 = searchParams.get('session2');

    if (!patientId && (!sessionId1 || !sessionId2)) {
      return NextResponse.json(
        { error: 'Provide patientId for auto-compare or session1 and session2 IDs' },
        { status: 400 }
      );
    }

    let session1, session2;

    if (sessionId1 && sessionId2) {
      // Get specific sessions
      [session1, session2] = await Promise.all([
        db.query.patientSessions.findFirst({
          where: eq(patientSessions.id, sessionId1),
        }),
        db.query.patientSessions.findFirst({
          where: eq(patientSessions.id, sessionId2),
        }),
      ]);
    } else if (patientId) {
      // Auto-compare: get the two most recent sessions with pain maps
      const recentSessions = await db.query.patientSessions.findMany({
        where: and(
          eq(patientSessions.patientId, patientId),
          sql`${patientSessions.painMap} IS NOT NULL`
        ),
        orderBy: [desc(patientSessions.date)],
        limit: 2,
      });

      if (recentSessions.length < 2) {
        return NextResponse.json(
          { error: 'Need at least 2 sessions with pain maps to compare' },
          { status: 400 }
        );
      }

      session1 = recentSessions[1]; // older
      session2 = recentSessions[0]; // newer
    }

    if (!session1 || !session2) {
      return NextResponse.json(
        { error: 'Sessions not found' },
        { status: 404 }
      );
    }

    const painMap1 = session1.painMap as PainMapData;
    const painMap2 = session2.painMap as PainMapData;

    // Calculate comparison metrics
    const comparison = {
      session1: {
        id: session1.id,
        date: session1.date,
        totalPoints: painMap1?.points?.length || 0,
        averageIntensity: calculateAverageIntensity(painMap1?.points),
        maxIntensity: calculateMaxIntensity(painMap1?.points),
        affectedAreas: getAffectedAreas(painMap1?.points),
        evaScore: session1.evaScore,
      },
      session2: {
        id: session2.id,
        date: session2.date,
        totalPoints: painMap2?.points?.length || 0,
        averageIntensity: calculateAverageIntensity(painMap2?.points),
        maxIntensity: calculateMaxIntensity(painMap2?.points),
        affectedAreas: getAffectedAreas(painMap2?.points),
        evaScore: session2.evaScore,
      },
      changes: calculateChanges(painMap1?.points, painMap2?.points),
      overall: calculateOverallImprovement(
        painMap1?.points,
        painMap2?.points,
        session1.evaScore,
        session2.evaScore
      ),
    };

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error comparing pain maps:', error);
    return NextResponse.json(
      { error: 'Failed to compare pain maps' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateAverageIntensity(points?: PainPoint[]): number {
  if (!points || points.length === 0) return 0;
  const sum = points.reduce((acc, p) => acc + (p.intensity || 0), 0);
  return Math.round((sum / points.length) * 10) / 10;
}

function calculateMaxIntensity(points?: PainPoint[]): number {
  if (!points || points.length === 0) return 0;
  return Math.max(...points.map(p => p.intensity || 0));
}

function getAffectedAreas(points?: PainPoint[]): string[] {
  if (!points || points.length === 0) return [];
  const areas = new Set<string>();
  points.forEach(p => {
    if (p.muscleGroup) areas.add(p.muscleGroup);
  });
  return Array.from(areas);
}

function calculateChanges(points1?: PainPoint[], points2?: PainPoint[]) {
  const areas1 = getAffectedAreas(points1);
  const areas2 = getAffectedAreas(points2);

  // Find resolved areas (were in session1 but not in session2)
  const resolvedAreas = areas1.filter(a => !areas2.includes(a));
  
  // Find new areas (are in session2 but not in session1)
  const newAreas = areas2.filter(a => !areas1.includes(a));
  
  // Find persistent areas
  const persistentAreas = areas1.filter(a => areas2.includes(a));

  // Calculate intensity changes for persistent areas
  const intensityChanges: Record<string, { before: number; after: number; change: number }> = {};
  
  persistentAreas.forEach(area => {
    const before = points1?.filter(p => p.muscleGroup === area)
      .reduce((sum, p) => sum + p.intensity, 0) || 0;
    const after = points2?.filter(p => p.muscleGroup === area)
      .reduce((sum, p) => sum + p.intensity, 0) || 0;
    
    intensityChanges[area] = {
      before,
      after,
      change: after - before,
    };
  });

  return {
    resolvedAreas,
    newAreas,
    persistentAreas,
    intensityChanges,
  };
}

function calculateOverallImprovement(
  points1?: PainPoint[],
  points2?: PainPoint[],
  eva1?: number | null,
  eva2?: number | null
) {
  const avg1 = calculateAverageIntensity(points1);
  const avg2 = calculateAverageIntensity(points2);

  let intensityImprovement = 0;
  if (avg1 > 0) {
    intensityImprovement = Math.round(((avg1 - avg2) / avg1) * 100);
  }

  let evaImprovement = null;
  if (eva1 !== null && eva1 !== undefined && eva2 !== null && eva2 !== undefined && eva1 > 0) {
    evaImprovement = Math.round(((eva1 - eva2) / eva1) * 100);
  }

  const pointCountChange = (points2?.length || 0) - (points1?.length || 0);

  let status: 'significantly_improved' | 'improved' | 'stable' | 'worsened' | 'significantly_worsened';
  
  if (intensityImprovement >= 30) {
    status = 'significantly_improved';
  } else if (intensityImprovement >= 10) {
    status = 'improved';
  } else if (intensityImprovement >= -10) {
    status = 'stable';
  } else if (intensityImprovement >= -30) {
    status = 'worsened';
  } else {
    status = 'significantly_worsened';
  }

  return {
    status,
    intensityImprovement,
    evaImprovement,
    pointCountChange,
    summary: getSummaryText(status, intensityImprovement, pointCountChange),
  };
}

function getSummaryText(status: string, intensityImprovement: number, pointCountChange: number): string {
  switch (status) {
    case 'significantly_improved':
      return `Melhora significativa! A intensidade média reduziu ${Math.abs(intensityImprovement)}%.`;
    case 'improved':
      return `Boa evolução. A intensidade da dor diminuiu ${Math.abs(intensityImprovement)}%.`;
    case 'stable':
      return 'Quadro estável. Continue o tratamento conforme planejado.';
    case 'worsened':
      return `Atenção: houve piora de ${Math.abs(intensityImprovement)}% na intensidade. Reavalie o plano.`;
    case 'significantly_worsened':
      return `Alerta: piora significativa de ${Math.abs(intensityImprovement)}%. Considere ajustes no tratamento.`;
    default:
      return 'Compare os resultados para avaliar a evolução.';
  }
}
