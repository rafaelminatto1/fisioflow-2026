import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nurturingSequences, nurturingSteps } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';

// GET /api/crm/nurturing-sequences - Get nurturing sequences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const sequences = await db.query.nurturingSequences.findMany({
      where: activeOnly ? eq(nurturingSequences.isActive, true) : undefined,
      with: {
        steps: {
          orderBy: [nurturingSteps.delayDays, nurturingSteps.order],
        },
      },
      orderBy: [desc(nurturingSequences.createdAt)],
    });

    // Transform to frontend format
    const formattedSequences = sequences.map(seq => ({
      id: seq.id,
      name: seq.name,
      description: seq.description,
      active: seq.isActive,
      triggers: seq.triggers || [],
      steps: seq.steps.map(step => ({
        id: step.id,
        delay: step.delayDays,
        type: step.channel,
        subject: step.subject,
        message: step.content,
        template: step.template,
      })),
      createdAt: seq.createdAt,
      updatedAt: seq.updatedAt,
    }));

    return NextResponse.json(formattedSequences);
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
    const { name, description, active, triggers, steps } = body;

    if (!name || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'name and steps are required' },
        { status: 400 }
      );
    }

    // Create the sequence
    const newSequence = await db.insert(nurturingSequences).values({
      name,
      description: description || null,
      isActive: active ?? true,
      triggers: triggers ?? [],
    }).returning();

    // Create steps
    if (steps.length > 0) {
      const stepsToInsert = steps.map((step: any, index: number) => ({
        sequenceId: newSequence[0].id,
        order: index + 1,
        delayDays: step.delay ?? 0,
        channel: step.type || 'whatsapp',
        subject: step.subject || null,
        content: step.message || null,
        template: step.template || null,
      }));

      await db.insert(nurturingSteps).values(stepsToInsert);
    }

    // Fetch the complete sequence with steps
    const completeSequence = await db.query.nurturingSequences.findFirst({
      where: eq(nurturingSequences.id, newSequence[0].id),
      with: {
        steps: true,
      },
    });

    // Invalidate cache
    await invalidatePattern('nurturing:*');

    return NextResponse.json(completeSequence, { status: 201 });
  } catch (error) {
    console.error('Error creating nurturing sequence:', error);
    return NextResponse.json(
      { error: 'Failed to create nurturing sequence' },
      { status: 500 }
    );
  }
}
