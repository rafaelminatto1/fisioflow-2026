import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// Lead scoring algorithm
function calculateLeadScore(lead: any): number {
  let score = 0;

  // Budget score (0-40 points)
  if (lead.budget) {
    const budgetInReais = lead.budget / 100;
    if (budgetInReais >= 5000) score += 40;
    else if (budgetInReais >= 2000) score += 30;
    else if (budgetInReais >= 1000) score += 20;
    else score += 10;
  }

  // Source score (0-30 points)
  switch (lead.source) {
    case 'referral':
      score += 30;
      break;
    case 'instagram':
      score += 20;
      break;
    case 'website':
      score += 15;
      break;
    case 'whatsapp':
      score += 25;
      break;
    default:
      score += 10;
  }

  // Status engagement score (0-30 points)
  switch (lead.status) {
    case 'qualified':
      score += 30;
      break;
    case 'contacted':
      score += 20;
      break;
    case 'new':
      score += 10;
      break;
    default:
      score += 0;
  }

  // Email presence (5 points)
  if (lead.email) score += 5;

  // Recent activity (based on updatedAt)
  const daysSinceUpdate = lead.updatedAt
    ? Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceUpdate <= 1) score += 10;
  else if (daysSinceUpdate <= 7) score += 5;
  else if (daysSinceUpdate > 30) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function getScoreTier(score: number): string {
  if (score >= 80) return 'hot'; // Alta prioridade
  if (score >= 50) return 'warm'; // Média prioridade
  return 'cold'; // Baixa prioridade
}

// GET /api/crm/scoring - Get lead scores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier'); // 'hot', 'warm', 'cold'

    const allLeads = await db.query.leads.findMany({
      orderBy: [leads.createdAt],
    });

    // Calculate scores for all leads
    const scoredLeads = allLeads.map((lead) => {
      const score = calculateLeadScore(lead);
      return {
        ...lead,
        score,
        tier: getScoreTier(score),
      };
    });

    // Filter by tier if specified
    const filtered = tier
      ? scoredLeads.filter((l: any) => l.tier === tier)
      : scoredLeads;

    // Sort by score descending
    filtered.sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({
      leads: filtered,
      summary: {
        hot: scoredLeads.filter((l: any) => l.tier === 'hot').length,
        warm: scoredLeads.filter((l: any) => l.tier === 'warm').length,
        cold: scoredLeads.filter((l: any) => l.tier === 'cold').length,
      },
    });
  } catch (error) {
    console.error('Error calculating lead scores:', error);
    return NextResponse.json(
      { error: 'Failed to calculate lead scores' },
      { status: 500 }
    );
  }
}

// POST /api/crm/scoring/[id] - Recalculate score for a specific lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, body.id),
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const score = calculateLeadScore(lead);

    // Invalidate cache
    await invalidatePattern('crm-scoring:*');

    return NextResponse.json({
      id: lead.id,
      name: lead.name,
      score,
      tier: getScoreTier(score),
    });
  } catch (error) {
    console.error('Error recalculating lead score:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate lead score' },
      { status: 500 }
    );
  }
}
