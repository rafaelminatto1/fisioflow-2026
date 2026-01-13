import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accountsReceivable, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST /api/accounts/receivable/[id]/pay - Register payment for an account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'amount and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Get the account
    const account = await db.select().from(accountsReceivable)
      .where(eq(accountsReceivable.id, id))
      .limit(1);

    if (!account[0]) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const currentAccount = account[0];
    const newPaidAmount = currentAccount.paidAmount + body.amount;
    const isFullyPaid = newPaidAmount >= currentAccount.amount;

    // Update account
    const updated = await db.update(accountsReceivable)
      .set({
        paidAmount: newPaidAmount,
        paidAt: isFullyPaid ? new Date() : currentAccount.paidAt,
        status: isFullyPaid ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending'),
        paymentMethod: body.paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(accountsReceivable.id, id))
      .returning();

    // Create transaction record
    await db.insert(transactions).values({
      id: nanoid(),
      patientId: currentAccount.patientId || null,
      type: 'income',
      category: 'payment',
      amount: body.amount,
      description: `Pagamento: ${currentAccount.description}`,
      paymentMethod: body.paymentMethod,
      date: new Date(),
    });

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
