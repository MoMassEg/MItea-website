import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/order-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: `Order '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}
