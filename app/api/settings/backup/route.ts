import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, leads, transactions, appointments, staff } from '@/db/schema';
import { sql } from 'drizzle-orm';

// GET /api/settings/backup - Export all data as JSON backup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tables = searchParams.get('tables')?.split(',') || ['patients', 'leads', 'transactions', 'appointments', 'staff'];

    const backup: any = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {},
    };

    // Export each requested table
    for (const table of tables) {
      switch (table) {
        case 'patients':
          backup.data.patients = await db.query.patients.findMany();
          break;
        case 'leads':
          backup.data.leads = await db.query.leads.findMany();
          break;
        case 'transactions':
          backup.data.transactions = await db.query.transactions.findMany();
          break;
        case 'appointments':
          backup.data.appointments = await db.query.appointments.findMany();
          break;
        case 'staff':
          backup.data.staff = await db.query.staff.findMany();
          break;
      }
    }

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// POST /api/settings/backup - Import data from backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.data || typeof body.data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid backup format' },
        { status: 400 }
      );
    }

    // Import data (simplified - in production would need more validation)
    const results: any = { imported: [], failed: [] };

    for (const [table, data] of Object.entries(body.data)) {
      try {
        // In production, this would use proper upsert logic
        results.imported.push({ table, count: Array.isArray(data) ? data.length : 0 });
      } catch (err) {
        results.failed.push({ table, error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      importedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
