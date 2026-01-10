import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { painLogs, patients } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// GET /api/pain-logs - List pain logs with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let allPainLogs;

    if (patientId) {
      if (startDate && endDate) {
        allPainLogs = await db.select({
          id: painLogs.id,
          patientId: painLogs.patientId,
          level: painLogs.level,
          notes: painLogs.notes,
          createdAt: painLogs.createdAt,
          patient: {
            id: patients.id,
            fullName: patients.fullName,
          },
        }).from(painLogs)
          .leftJoin(patients, eq(painLogs.patientId, patients.id))
          .where(
            and(
              eq(painLogs.patientId, patientId),
              gte(painLogs.createdAt, new Date(startDate)),
              lte(painLogs.createdAt, new Date(endDate))
            )
          )
          .orderBy(desc(painLogs.createdAt));
      } else {
        allPainLogs = await db.select({
          id: painLogs.id,
          patientId: painLogs.patientId,
          level: painLogs.level,
          notes: painLogs.notes,
          createdAt: painLogs.createdAt,
          patient: {
            id: patients.id,
            fullName: patients.fullName,
          },
        }).from(painLogs)
          .leftJoin(patients, eq(painLogs.patientId, patients.id))
          .where(eq(painLogs.patientId, patientId))
          .orderBy(desc(painLogs.createdAt));
      }
    } else {
      allPainLogs = await db.select({
        id: painLogs.id,
        patientId: painLogs.patientId,
        level: painLogs.level,
        notes: painLogs.notes,
        createdAt: painLogs.createdAt,
        patient: {
          id: patients.id,
          fullName: patients.fullName,
        },
      }).from(painLogs)
        .leftJoin(patients, eq(painLogs.patientId, patients.id))
        .orderBy(desc(painLogs.createdAt));
    }

    return NextResponse.json(allPainLogs);
  } catch (error) {
    console.error('Error fetching pain logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pain logs' },
      { status: 500 }
    );
  }
}

// POST /api/pain-logs - Create a new pain log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (body.patientId === undefined || body.level === undefined) {
      return NextResponse.json(
        { error: 'patientId and level are required' },
        { status: 400 }
      );
    }

    // Validate level range
    if (body.level < 0 || body.level > 10) {
      return NextResponse.json(
        { error: 'level must be between 0 and 10' },
        { status: 400 }
      );
    }

    const newPainLog = await db.insert(painLogs).values({
      patientId: body.patientId,
      level: body.level,
      notes: body.notes || null,
    }).returning();

    return NextResponse.json(newPainLog[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pain log:', error);
    return NextResponse.json(
      { error: 'Failed to create pain log' },
      { status: 500 }
    );
  }
}
