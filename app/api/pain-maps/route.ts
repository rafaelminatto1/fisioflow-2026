import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientSessions, patients } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { withCache, invalidatePattern } from '@/lib/vercel-kv';

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

// GET /api/pain-maps - Get pain map history for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    // Get sessions with pain maps for the patient
    const sessions = await db.query.patientSessions.findMany({
      where: and(
        eq(patientSessions.patientId, patientId),
        sql`${patientSessions.painMap} IS NOT NULL`
      ),
      orderBy: [desc(patientSessions.date)],
      limit,
    });

    // Transform to pain map history
    const painMapHistory = sessions.map(session => ({
      sessionId: session.id,
      date: session.date,
      painMap: session.painMap as PainMapData,
      evaScore: session.evaScore,
      totalPoints: (session.painMap as PainMapData)?.points?.length || 0,
      averageIntensity: calculateAverageIntensity((session.painMap as PainMapData)?.points),
      maxIntensity: calculateMaxIntensity((session.painMap as PainMapData)?.points),
      affectedAreas: getAffectedAreas((session.painMap as PainMapData)?.points),
    }));

    return NextResponse.json({
      patientId,
      history: painMapHistory,
      summary: calculatePainMapSummary(painMapHistory),
    });
  } catch (error) {
    console.error('Error fetching pain maps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pain maps' },
      { status: 500 }
    );
  }
}

// POST /api/pain-maps - Save a pain map (standalone, not part of session)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { patientId, painMap, date, notes } = body;

    if (!patientId || !painMap) {
      return NextResponse.json(
        { error: 'patientId and painMap are required' },
        { status: 400 }
      );
    }

    // Create a session entry with just the pain map
    const newSession = await db.insert(patientSessions).values({
      patientId,
      date: date || new Date().toISOString().split('T')[0],
      painMap: painMap as PainMapData,
      therapistNotes: notes || null,
      sessionType: 'avaliacao',
    }).returning();

    // Invalidate cache
    await invalidatePattern(`patient:${patientId}:*`);

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('Error saving pain map:', error);
    return NextResponse.json(
      { error: 'Failed to save pain map' },
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

function calculatePainMapSummary(history: any[]) {
  if (history.length === 0) {
    return {
      totalSessions: 0,
      trend: 'neutral',
      improvement: null,
      mostAffectedAreas: [],
    };
  }

  // Calculate improvement trend
  let trend: 'improving' | 'worsening' | 'stable' | 'neutral' = 'neutral';
  let improvement: number | null = null;

  if (history.length >= 2) {
    const latest = history[0].averageIntensity;
    const previous = history[1].averageIntensity;

    if (previous > 0) {
      improvement = Math.round(((previous - latest) / previous) * 100);
      
      if (improvement > 10) {
        trend = 'improving';
      } else if (improvement < -10) {
        trend = 'worsening';
      } else {
        trend = 'stable';
      }
    }
  }

  // Get most affected areas across all sessions
  const areaCount: Record<string, number> = {};
  history.forEach(h => {
    h.affectedAreas.forEach((area: string) => {
      areaCount[area] = (areaCount[area] || 0) + 1;
    });
  });

  const mostAffectedAreas = Object.entries(areaCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area]) => area);

  return {
    totalSessions: history.length,
    trend,
    improvement,
    mostAffectedAreas,
    latestIntensity: history[0]?.averageIntensity || 0,
  };
}
