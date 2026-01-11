import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stock } from '@/db/schema';
import { eq, desc, lte } from 'drizzle-orm';

// GET /api/stock - List all stock items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock'); // 'true' to show only items below min quantity

    let stockList;

    if (category) {
      stockList = await db.select().from(stock)
        .where(eq(stock.category, category))
        .orderBy(desc(stock.createdAt));
    } else {
      stockList = await db.select().from(stock)
        .orderBy(desc(stock.createdAt));
    }

    // Filter for low stock items if requested
    if (lowStock === 'true') {
      stockList = stockList.filter(item => item.quantity <= item.minQuantity);
    }

    return NextResponse.json(stockList);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock items' },
      { status: 500 }
    );
  }
}

// POST /api/stock - Create a new stock item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const newStockItem = await db.insert(stock).values({
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      quantity: body.quantity || 0,
      minQuantity: body.minQuantity || 5,
      unit: body.unit || 'unit',
      costPerUnit: body.costPerUnit || null,
      supplier: body.supplier || null,
    }).returning();

    return NextResponse.json(newStockItem[0], { status: 201 });
  } catch (error) {
    console.error('Error creating stock item:', error);
    return NextResponse.json(
      { error: 'Failed to create stock item' },
      { status: 500 }
    );
  }
}
