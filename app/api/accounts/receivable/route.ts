import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accountsReceivable, patients } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/accounts/receivable - List accounts receivable
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue');

    const conditions = [];

    if (patientId) {
      conditions.push(eq(accountsReceivable.patientId, patientId));
    }
    if (status) {
      conditions.push(eq(accountsReceivable.status, status as any));
    }
    if (overdue === 'true') {
      conditions.push(
        and(
          eq(accountsReceivable.status, 'pending'),
          sql`${accountsReceivable.dueDate} < NOW()`
        )
      );
    }

    const accounts = await db.select({
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
    })
      .from(accountsReceivable)
      .leftJoin(patients, eq(accountsReceivable.patientId, patients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(accountsReceivable.dueDate));

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts receivable:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts receivable' }, { status: 500 });
  }
}

// POST /api/accounts/receivable - Create a new account receivable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.description || !body.amount || !body.dueDate) {
      return NextResponse.json(
        { error: 'description, amount, and dueDate are required' },
        { status: 400 }
      );
    }

    const newAccount = await db.insert(accountsReceivable).values({
      id: nanoid(),
      patientId: body.patientId || null,
      description: body.description,
      amount: body.amount,
      dueDate: new Date(body.dueDate),
      paidAmount: 0,
      paymentMethod: body.paymentMethod || null,
      installmentNumber: body.installmentNumber || null,
      totalInstallments: body.totalInstallments || null,
      notes: body.notes || null,
    }).returning();

    return NextResponse.json(newAccount[0], { status: 201 });
  } catch (error) {
    console.error('Error creating account receivable:', error);
    return NextResponse.json({ error: 'Failed to create account receivable' }, { status: 500 });
  }
}
