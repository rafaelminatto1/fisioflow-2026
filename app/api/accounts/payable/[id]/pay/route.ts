import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accountsPayable, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/accounts/payable/[id]/pay - Register payment for an account payable
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
    const account = await db.select().from(accountsPayable)
      .where(eq(accountsPayable.id, id))
      .limit(1);

    if (!account[0]) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const currentAccount = account[0];
    const newPaidAmount = currentAccount.paidAmount + body.amount;
    const isFullyPaid = newPaidAmount >= currentAccount.amount;

    // Update account
    const updated = await db.update(accountsPayable)
      .set({
        paidAmount: newPaidAmount,
        paidAt: isFullyPaid ? new Date() : currentAccount.paidAt,
        status: isFullyPaid ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending'),
        paymentMethod: body.paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(accountsPayable.id, id))
      .returning();

    // Create transaction record
    await db.insert(transactions).values({
      id: id, // reuse same id for simplicity
      type: 'expense',
      category: currentAccount.category || 'other',
      amount: body.amount,
      description: `Pagamento: ${currentAccount.description} - ${currentAccount.supplier}`,
      paymentMethod: body.paymentMethod,
      date: new Date(),
    });

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
