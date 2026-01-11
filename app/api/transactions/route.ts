import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// GET /api/transactions - List transactions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type'); // 'income', 'expense'
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build conditions array
    const conditions = [];

    if (patientId) {
      conditions.push(eq(transactions.patientId, patientId));
    }

    if (type) {
      conditions.push(eq(transactions.type, type));
    }

    if (category) {
      conditions.push(eq(transactions.category, category));
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      conditions.push(
        and(
          gte(transactions.date, start),
          lte(transactions.date, end)
        )
      );
    }

    // Execute query with combined conditions or without conditions
    const transactionList = conditions.length > 0
      ? await db.select().from(transactions)
          .where(and(...conditions))
          .orderBy(desc(transactions.date))
      : await db.select().from(transactions)
          .orderBy(desc(transactions.date));

    return NextResponse.json(transactionList);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.category || body.amount === undefined) {
      return NextResponse.json(
        { error: 'type, category, and amount are required' },
        { status: 400 }
      );
    }

    const newTransaction = await db.insert(transactions).values({
      patientId: body.patientId || null,
      type: body.type,
      category: body.category,
      amount: body.amount,
      description: body.description || null,
      paymentMethod: body.paymentMethod || null,
      date: body.date || new Date(),
    }).returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
