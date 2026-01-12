import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientAssessments, assessmentTemplates } from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { withCache } from '@/lib/vercel-kv';

// GET /api/assessments/results - Get assessment results with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const templateId = searchParams.get('templateId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    let cacheKey = `assessment-results:${patientId || 'all'}:${templateId || 'all'}`;
    let whereClause: any = undefined;

    // Build where clause
    const conditions = [];

    if (patientId) {
      conditions.push(eq(patientAssessments.patientId, patientId));
    }

    if (templateId) {
      conditions.push(eq(patientAssessments.templateId, templateId));
    }

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    const results = await withCache(
      cacheKey,
      async () => {
        return await db.query.patientAssessments.findMany({
          where: whereClause,
          with: {
            patient: true,
            template: true,
          },
          orderBy: [desc(patientAssessments.assessmentDate)],
          limit,
        });
      },
      { ttl: 180 }
    );

    // Filter by date range in JS (simpler than SQL date casting)
    let filteredResults = results;
    if (startDate) {
      const start = new Date(startDate);
      filteredResults = filteredResults.filter(r => new Date(r.assessmentDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filteredResults = filteredResults.filter(r => new Date(r.assessmentDate) <= end);
    }

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment results' },
      { status: 500 }
    );
  }
}
