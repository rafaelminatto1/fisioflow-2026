import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stock } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/stock/[id] - Get a specific stock item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stockItem = await db.select().from(stock).where(eq(stock.id, id));

    if (!stockItem || stockItem.length === 0) {
      return NextResponse.json(
        { error: 'Stock item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stockItem[0]);
  } catch (error) {
    console.error('Error fetching stock item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock item' },
      { status: 500 }
    );
  }
}

// PUT /api/stock/[id] - Update a stock item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(stock)
      .set({
        name: body.name,
        description: body.description,
        category: body.category,
        quantity: body.quantity,
        minQuantity: body.minQuantity,
        unit: body.unit,
        costPerUnit: body.costPerUnit,
        supplier: body.supplier,
        updatedAt: new Date(),
      })
      .where(eq(stock.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Stock item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating stock item:', error);
    return NextResponse.json(
      { error: 'Failed to update stock item' },
      { status: 500 }
    );
  }
}

// DELETE /api/stock/[id] - Delete a stock item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db.delete(stock)
      .where(eq(stock.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Stock item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock item' },
      { status: 500 }
    );
  }
}
