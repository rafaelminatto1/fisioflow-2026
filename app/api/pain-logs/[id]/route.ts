import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { painLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE /api/pain-logs/[id] - Delete a pain log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(painLogs).where(eq(painLogs.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pain log:', error);
    return NextResponse.json(
      { error: 'Failed to delete pain log' },
      { status: 500 }
    );
  }
}
