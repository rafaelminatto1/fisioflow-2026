import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accountsReceivable, transactions, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendPaymentConfirmation, isWhatsAppAvailable } from '@/lib/whatsapp';

// GET /api/accounts/receivable/[id] - Get a single account receivable
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await db.select({
      id: accountsReceivable.id,
      patientId: accountsReceivable.patientId,
      description: accountsReceivable.description,
      amount: accountsReceivable.amount,
      dueDate: accountsReceivable.dueDate,
      paidAmount: accountsReceivable.paidAmount,
      paidAt: accountsReceivable.paidAt,
      status: accountsReceivable.status,
      paymentMethod: accountsReceivable.paymentMethod,
      installmentNumber: accountsReceivable.installmentNumber,
      totalInstallments: accountsReceivable.totalInstallments,
      notes: accountsReceivable.notes,
      createdAt: accountsReceivable.createdAt,
      updatedAt: accountsReceivable.updatedAt,
      patientName: patients.fullName,
      patientPhone: patients.phone,
    })
      .from(accountsReceivable)
      .leftJoin(patients, eq(accountsReceivable.patientId, patients.id))
      .where(eq(accountsReceivable.id, id));

    if (!account || account.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(account[0]);
  } catch (error) {
    console.error('Error fetching account receivable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account receivable' },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/receivable/[id] - Update an account receivable
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(accountsReceivable)
      .set({
        patientId: body.patientId,
        description: body.description,
        amount: body.amount,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        paymentMethod: body.paymentMethod,
        installmentNumber: body.installmentNumber,
        totalInstallments: body.totalInstallments,
        notes: body.notes,
        status: body.status,
        paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
        paidAmount: body.paidAmount,
        updatedAt: new Date(),
      })
      .where(eq(accountsReceivable.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating account receivable:', error);
    return NextResponse.json(
      { error: 'Failed to update account receivable' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/receivable/[id] - Delete an account receivable
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.delete(accountsReceivable).where(eq(accountsReceivable.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account receivable:', error);
    return NextResponse.json(
      { error: 'Failed to delete account receivable' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/receivable/[id] - Mark as paid or partial payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'pay') {
      // Get the account with patient info
      const account = await db.select({
        id: accountsReceivable.id,
        patientId: accountsReceivable.patientId,
        description: accountsReceivable.description,
        amount: accountsReceivable.amount,
        paidAmount: accountsReceivable.paidAmount,
        paymentMethod: accountsReceivable.paymentMethod,
        patientName: patients.fullName,
        patientPhone: patients.phone,
      })
        .from(accountsReceivable)
        .leftJoin(patients, eq(accountsReceivable.patientId, patients.id))
        .where(eq(accountsReceivable.id, id));

      if (!account || account.length === 0) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }

      const paidAmount = body.paidAmount || account[0].amount;
      const paymentMethod = body.paymentMethod || account[0].paymentMethod;
      const totalPaid = (account[0].paidAmount || 0) + paidAmount;
      const isFullyPaid = totalPaid >= (account[0].amount || 0);

      // Update account status
      const updated = await db.update(accountsReceivable)
        .set({
          status: isFullyPaid ? 'paid' : 'partial',
          paidAt: isFullyPaid ? new Date() : undefined,
          paidAmount: totalPaid,
          paymentMethod: paymentMethod,
          updatedAt: new Date(),
        })
        .where(eq(accountsReceivable.id, id))
        .returning();

      // Create transaction record
      await db.insert(transactions).values({
        patientId: account[0].patientId,
        description: `Recebimento: ${account[0].description} (Ref: Conta a receber #${id})`,
        amount: paidAmount,
        type: 'income',
        category: 'services',
        date: new Date(),
        paymentMethod: paymentMethod,
      });

      // Send WhatsApp confirmation if patient has phone
      let whatsAppSent = false;
      if (body.sendWhatsApp && account[0].patientPhone && isWhatsAppAvailable()) {
        whatsAppSent = await sendPaymentConfirmation(
          account[0].patientName || 'Paciente',
          account[0].patientPhone,
          paidAmount,
          account[0].description || 'Sessão de fisioterapia'
        );
      }

      return NextResponse.json({
        success: true,
        account: updated[0],
        message: isFullyPaid
          ? 'Pagamento completo registrado'
          : `Pagamento parcial registrado. Restam R$ ${((account[0].amount || 0) - totalPaid).toFixed(2)}`,
        whatsAppSent,
      });
    }

    if (action === 'cancel') {
      // Cancel the account receivable
      const updated = await db.update(accountsReceivable)
        .set({
          status: 'cancelled',
          notes: body.reason || 'Cancelado pelo usuário',
          updatedAt: new Date(),
        })
        .where(eq(accountsReceivable.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        account: updated[0],
        message: 'Conta cancelada',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "pay" or "cancel"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing account receivable action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
