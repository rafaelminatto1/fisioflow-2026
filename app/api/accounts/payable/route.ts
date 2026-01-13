import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accountsPayable } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/accounts/payable - List accounts payable
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const supplier = searchParams.get('supplier');
    const overdue = searchParams.get('overdue');

    const conditions = [];

    if (status) {
      conditions.push(eq(accountsPayable.status, status as any));
    }
    if (category) {
      conditions.push(eq(accountsPayable.category, category as any));
    }
    if (supplier) {
      conditions.push(sql`${accountsPayable.supplier} ILIKE ${`%${supplier}%`}`);
    }
    if (overdue === 'true') {
      conditions.push(
        and(
          eq(accountsPayable.status, 'pending'),
          sql`${accountsPayable.dueDate} < NOW()`
        )
      );
    }

    const accounts = await db.select()
      .from(accountsPayable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(accountsPayable.dueDate));

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts payable:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts payable' }, { status: 500 });
  }
}

// POST /api/accounts/payable - Create a new account payable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.supplier || !body.description || !body.amount || !body.dueDate) {
      return NextResponse.json(
        { error: 'supplier, description, amount, and dueDate are required' },
        { status: 400 }
      );
    }

    const newAccount = await db.insert(accountsPayable).values({
      id: nanoid(),
      supplier: body.supplier,
      description: body.description,
      amount: body.amount,
      dueDate: new Date(body.dueDate),
      category: body.category || 'other',
      paymentMethod: body.paymentMethod || null,
      documentNumber: body.documentNumber || null,
      notes: body.notes || null,
    }).returning();

    return NextResponse.json(newAccount[0], { status: 201 });
  } catch (error) {
    console.error('Error creating account payable:', error);
    return NextResponse.json({ error: 'Failed to create account payable' }, { status: 500 });
  }
}
