import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stock } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/stock/[id]/adjust - Adjust stock quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.adjustment === undefined) {
      return NextResponse.json(
        { error: 'adjustment is required (can be positive or negative)' },
        { status: 400 }
      );
    }

    // Get current stock
    const currentStock = await db.select().from(stock).where(eq(stock.id, id));

    if (!currentStock || currentStock.length === 0) {
      return NextResponse.json(
        { error: 'Stock item not found' },
        { status: 404 }
      );
    }

    const newQuantity = Math.max(0, currentStock[0].quantity + body.adjustment);

    const updated = await db.update(stock)
      .set({
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(eq(stock.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return NextResponse.json(
      { error: 'Failed to adjust stock quantity' },
      { status: 500 }
    );
  }
}
