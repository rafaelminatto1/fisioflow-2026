import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nurturingSequences, nurturingSteps, nurturingLogs, leads, patients } from '@/db/schema';
import { eq, and, lte, isNull, sql } from 'drizzle-orm';
import { sendWhatsAppMessage, sendLeadFirstContact, isWhatsAppAvailable } from '@/lib/whatsapp';

// POST /api/crm/nurturing-sequences/process - Process pending nurturing messages
export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    // Get all active sequences with their steps
    const activeSequences = await db.query.nurturingSequences.findMany({
      where: eq(nurturingSequences.isActive, true),
      with: {
        steps: {
          orderBy: [nurturingSteps.delayDays, nurturingSteps.order],
        },
      },
    });

    // Process each sequence
    for (const sequence of activeSequences) {
      const triggers = sequence.triggers as string[] || [];

      // Handle different trigger types
      for (const trigger of triggers) {
        switch (trigger) {
          case 'new_lead':
            await processNewLeadsTrigger(sequence, results);
            break;
          case 'inactive_30_days':
            await processInactivePatientsTrigger(sequence, results);
            break;
          case 'after_appointment':
            // This would be triggered separately after appointments
            break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error processing nurturing sequences:', error);
    return NextResponse.json(
      { error: 'Failed to process nurturing sequences' },
      { status: 500 }
    );
  }
}

// Process new leads trigger
async function processNewLeadsTrigger(sequence: any, results: any) {
  const now = new Date();

  // Find leads that need nurturing
  for (const step of sequence.steps) {
    const delayMs = step.delayDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(now.getTime() - delayMs);

    // Find leads created around the step's delay time that haven't received this step
    const eligibleLeads = await db.execute(sql`
      SELECT l.* FROM leads l
      WHERE l.status = 'new'
      AND l.created_at <= ${cutoffDate.toISOString()}
      AND NOT EXISTS (
        SELECT 1 FROM nurturing_logs nl
        WHERE nl.target_id = l.id
        AND nl.step_id = ${step.id}
      )
      LIMIT 50
    `);

    for (const lead of eligibleLeads.rows as any[]) {
      results.processed++;

      let success = false;
      let errorMessage = null;

      try {
        if (step.channel === 'whatsapp' && lead.phone && isWhatsAppAvailable()) {
          // Replace template variables
          const message = replaceVariables(step.content || '', {
            nome: lead.name,
            telefone: lead.phone,
            email: lead.email || '',
          });

          const result = await sendWhatsAppMessage({
            number: lead.phone,
            text: message,
          });

          success = result !== null;
        } else if (step.channel === 'email') {
          // Email sending would be implemented here
          console.log(`Would send email to ${lead.email}: ${step.subject}`);
          success = true; // Placeholder
        }

        if (success) {
          results.sent++;
          
          // Update lead status if first contact
          if (step.order === 1 && lead.status === 'new') {
            await db.update(leads)
              .set({ status: 'contacted', updatedAt: new Date() })
              .where(eq(leads.id, lead.id));
          }
        } else {
          results.failed++;
          errorMessage = 'Failed to send message';
        }
      } catch (e: any) {
        results.failed++;
        errorMessage = e.message;
      }

      // Log the nurturing action
      await db.insert(nurturingLogs).values({
        sequenceId: sequence.id,
        stepId: step.id,
        targetType: 'lead',
        targetId: lead.id,
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : null,
        errorMessage,
      });

      results.details.push({
        sequenceId: sequence.id,
        stepId: step.id,
        targetId: lead.id,
        targetName: lead.name,
        channel: step.channel,
        success,
        errorMessage,
      });
    }
  }
}

// Process inactive patients trigger
async function processInactivePatientsTrigger(sequence: any, results: any) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const step of sequence.steps) {
    const delayMs = step.delayDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(now.getTime() - delayMs);

    // Find patients inactive for 30+ days that haven't received this step
    const eligiblePatients = await db.execute(sql`
      SELECT p.* FROM patients p
      WHERE p.status = 'active'
      AND (p.last_active_date <= ${thirtyDaysAgo.toISOString()} OR p.last_active_date IS NULL)
      AND NOT EXISTS (
        SELECT 1 FROM nurturing_logs nl
        WHERE nl.target_id = p.id
        AND nl.step_id = ${step.id}
        AND nl.created_at > ${thirtyDaysAgo.toISOString()}
      )
      LIMIT 50
    `);

    for (const patient of eligiblePatients.rows as any[]) {
      results.processed++;

      let success = false;
      let errorMessage = null;

      try {
        if (step.channel === 'whatsapp' && patient.phone && isWhatsAppAvailable()) {
          const message = replaceVariables(step.content || '', {
            nome: patient.full_name || 'Paciente',
            telefone: patient.phone,
            email: patient.email || '',
          });

          const result = await sendWhatsAppMessage({
            number: patient.phone,
            text: message,
          });

          success = result !== null;
        } else if (step.channel === 'email') {
          console.log(`Would send reactivation email to ${patient.email}: ${step.subject}`);
          success = true;
        }

        if (success) {
          results.sent++;
        } else {
          results.failed++;
          errorMessage = 'Failed to send message';
        }
      } catch (e: any) {
        results.failed++;
        errorMessage = e.message;
      }

      // Log the nurturing action
      await db.insert(nurturingLogs).values({
        sequenceId: sequence.id,
        stepId: step.id,
        targetType: 'patient',
        targetId: patient.id,
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : null,
        errorMessage,
      });

      results.details.push({
        sequenceId: sequence.id,
        stepId: step.id,
        targetId: patient.id,
        targetName: patient.full_name,
        channel: step.channel,
        success,
        errorMessage,
      });
    }
  }
}

// Helper to replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'gi'), value);
    result = result.replace(new RegExp(`\\{${key}\\}`, 'gi'), value);
  }
  return result;
}
