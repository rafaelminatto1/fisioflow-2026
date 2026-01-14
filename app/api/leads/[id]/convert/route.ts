import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { invalidatePattern } from '@/lib/vercel-kv';
import { sendWelcomeMessage, isWhatsAppAvailable } from '@/lib/whatsapp';

// POST /api/leads/[id]/convert - Convert a lead to a patient
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get the lead
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, id),
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Check if a patient with this phone already exists
    const existingPatient = await db.query.patients.findFirst({
      where: eq(patients.phone, lead.phone || ''),
    });

    if (existingPatient) {
      // Update lead status and link to existing patient
      await db.update(leads)
        .set({
          status: 'converted',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, id));

      return NextResponse.json({
        success: true,
        message: 'Lead convertido - paciente já existia',
        patient: existingPatient,
        isNew: false,
      });
    }

    // Create new patient from lead data
    const newPatient = await db.insert(patients).values({
      fullName: lead.name,
      email: lead.email,
      phone: lead.phone,
      isActive: true,
      // Additional fields from request body
      birthDate: body.birthDate || null,
      cpf: body.cpf || null,
      address: body.address || null,
      condition: lead.notes || body.condition || null,
    }).returning();

    // Update lead status to converted
    await db.update(leads)
      .set({
        status: 'converted',
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id));

    // Send welcome WhatsApp message if available
    let whatsAppSent = false;
    if (body.sendWelcome && lead.phone && isWhatsAppAvailable()) {
      whatsAppSent = await sendWelcomeMessage(lead.name, lead.phone);
    }

    // Invalidate caches
    await invalidatePattern('patients:*');
    await invalidatePattern('leads:*');
    await invalidatePattern('crm-*');

    return NextResponse.json({
      success: true,
      message: 'Lead convertido em paciente com sucesso',
      patient: newPatient[0],
      isNew: true,
      whatsAppSent,
    });
  } catch (error) {
    console.error('Error converting lead to patient:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead to patient' },
      { status: 500 }
    );
  }
}
