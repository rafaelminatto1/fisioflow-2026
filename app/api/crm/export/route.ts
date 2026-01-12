import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, patients } from '@/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';

// GET /api/crm/export - Export leads data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = undefined;

    if (startDate || endDate) {
      const conditions = [];
      if (startDate) {
        conditions.push(sql`created_at >= ${new Date(startDate)}`);
      }
      if (endDate) {
        conditions.push(sql`created_at <= ${new Date(endDate)}`);
      }
      if (conditions.length > 0) {
        whereClause = and(...conditions);
      }
    }

    const leadsData = await db.query.leads.findMany({
      where: whereClause,
      orderBy: [leads.createdAt],
    });

    // Enrich with patient conversion data
    const enrichedLeads = await Promise.all(
      leadsData.map(async (lead) => {
        const convertedPatient = await db.query.patients.findFirst({
          where: sql`(phone = ${lead.phone} OR email = ${lead.email})`,
        });

        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          budget: lead.budget ? (lead.budget / 100).toFixed(2) : null,
          notes: lead.notes,
          converted: !!convertedPatient,
          patientId: convertedPatient?.id || null,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
        };
      })
    );

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Origem', 'Status', 'Orçamento', 'Notas', 'Convertido', 'Data Criação'];
      const rows = enrichedLeads.map((l: any) => [
        l.id,
        l.name,
        l.email || '',
        l.phone || '',
        l.source || '',
        l.status,
        l.budget || '',
        l.notes || '',
        l.converted ? 'Sim' : 'Não',
        new Date(l.createdAt).toLocaleDateString('pt-BR'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="leads-export.csv"',
        },
      });
    }

    return NextResponse.json({
      leads: enrichedLeads,
      total: enrichedLeads.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}
