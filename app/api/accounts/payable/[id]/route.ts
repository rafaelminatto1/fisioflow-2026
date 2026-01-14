import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accountsPayable, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/accounts/payable/[id] - Get a single account payable
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await db.select()
      .from(accountsPayable)
      .where(eq(accountsPayable.id, id));

    if (!account || account.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(account[0]);
  } catch (error) {
    console.error('Error fetching account payable:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account payable' },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/payable/[id] - Update an account payable
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(accountsPayable)
      .set({
        supplier: body.supplier,
        description: body.description,
        amount: body.amount,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        category: body.category,
        paymentMethod: body.paymentMethod,
        documentNumber: body.documentNumber,
        notes: body.notes,
        status: body.status,
        paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
        paidAmount: body.paidAmount,
        updatedAt: new Date(),
      })
      .where(eq(accountsPayable.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating account payable:', error);
    return NextResponse.json(
      { error: 'Failed to update account payable' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/payable/[id] - Delete an account payable
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.delete(accountsPayable).where(eq(accountsPayable.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account payable:', error);
    return NextResponse.json(
      { error: 'Failed to delete account payable' },
      { status: 500 }
    );
  }
}

// PATCH /api/accounts/payable/[id] - Mark as paid
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'pay') {
      // Get the account
      const account = await db.select()
        .from(accountsPayable)
        .where(eq(accountsPayable.id, id));

      if (!account || account.length === 0) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }

      const paidAmount = body.paidAmount || account[0].amount;
      const paymentMethod = body.paymentMethod || account[0].paymentMethod;

      // Update account status
      const updated = await db.update(accountsPayable)
        .set({
          status: 'paid',
          paidAt: new Date(),
          paidAmount: paidAmount,
          paymentMethod: paymentMethod,
          updatedAt: new Date(),
        })
        .where(eq(accountsPayable.id, id))
        .returning();

      // Create transaction record
      await db.insert(transactions).values({
        description: `Pagamento: ${account[0].description}`,
        amount: paidAmount,
        type: 'expense',
        category: account[0].category || 'other',
        date: new Date(),
        paymentMethod: paymentMethod,
        notes: `Ref: Conta a pagar #${id}`,
      });

      return NextResponse.json({
        success: true,
        account: updated[0],
        message: 'Conta marcada como paga e transação registrada',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing account payable action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
