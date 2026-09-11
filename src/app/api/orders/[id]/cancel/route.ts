import { NextResponse } from 'next/server';
import { cancelOrder } from '@/lib/order-service';
import { cancelOrderSchema } from '@/lib/validators/order';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let reason: string | undefined;
    try {
      const body = await request.json();
      const parsed = cancelOrderSchema.safeParse(body);
      if (parsed.success) {
        reason = parsed.data.reason;
      }
    } catch {
      // Body is optional
    }

    const result = await cancelOrder(id, reason);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order successfully cancelled',
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
