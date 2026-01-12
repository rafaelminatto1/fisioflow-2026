import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, leads, staff, appointments } from '@/db/schema';
import { or, ilike, eq } from 'drizzle-orm';

// GET /api/search/global - Global search across all entities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const types = searchParams.get('types')?.split(',') || ['patients', 'leads', 'staff', 'appointments'];
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results: any = {
      patients: [],
      leads: [],
      staff: [],
      appointments: [],
    };

    // Search patients
    if (types.includes('patients')) {
      const patientResults = await db.query.patients.findMany({
        where: or(
          ilike(patients.fullName, `%${query}%`),
          ilike(patients.email, `%${query}%`),
          ilike(patients.phone, `%${query}%`)
        ),
        limit,
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });
      results.patients = patientResults.map((p) => ({
        ...p,
        tags: p.tags.map((pt: any) => pt.tag),
        type: 'patient',
      }));
    }

    // Search leads
    if (types.includes('leads')) {
      const leadResults = await db.query.leads.findMany({
        where: or(
          ilike(leads.name, `%${query}%`),
          ilike(leads.email, `%${query}%`),
          ilike(leads.phone, `%${query}%`)
        ),
        limit,
      });
      results.leads = leadResults.map((l) => ({
        ...l,
        type: 'lead',
      }));
    }

    // Search staff
    if (types.includes('staff')) {
      const staffResults = await db.query.staff.findMany({
        where: or(
          ilike(staff.name, `%${query}%`),
          ilike(staff.email, `%${query}%`)
        ),
        limit,
      });
      results.staff = staffResults.map((s) => ({
        ...s,
        type: 'staff',
      }));
    }

    // Search appointments (by patient name)
    if (types.includes('appointments')) {
      const appointmentResults = await db.execute(`
        SELECT
          a.*,
          p.full_name as "patientName"
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE p.full_name ILIKE '%${query}%'
        ORDER BY a.start_time DESC
        LIMIT ${limit}
      `);
      results.appointments = appointmentResults.map((a: any) => ({
        ...a,
        type: 'appointment',
      }));
    }

    // Flatten results for unified view
    const flattened = [
      ...results.patients,
      ...results.leads,
      ...results.staff,
      ...results.appointments,
    ];

    return NextResponse.json({
      query,
      byType: results,
      all: flattened,
      total: flattened.length,
    });
  } catch (error) {
    console.error('Error performing global search:', error);
    return NextResponse.json(
      { error: 'Failed to perform global search' },
      { status: 500 }
    );
  }
}
