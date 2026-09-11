import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/order-service';
import { createRateLimiter } from '@/lib/rate-limit';

const cashLimiter = createRateLimiter(10, 60 * 1000); // 10 requests per minute per IP

/**
 * POST /api/payments/cash
 * Marks an order as cash payment and immediately confirms it.
 * Body: { orderId: string }
 */
export async function POST(request: Request) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await cashLimiter.limit(`cash:${ip}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: `Order '${orderId}' not found` },
        { status: 404 }
      );
    }

    const currentStatus: string = order.status;
    if (currentStatus === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot process payment for a cancelled order' },
        { status: 400 }
      );
    }

    if (currentStatus === 'CONFIRMED') {
      // Idempotent: already confirmed
      return NextResponse.json({
        success: true,
        order: { id: order.id, orderNumber: order.order_number, status: 'CONFIRMED' },
        message: 'Order already confirmed',
      });
    }

    const updated = await updateOrderStatus(orderId, 'CONFIRMED', 'PENDING');
    return NextResponse.json({
      success: true,
      order: {
        id: updated!.id,
        orderNumber: updated!.order_number,
        status: 'CONFIRMED',
        paymentMethod: 'CASH',
      },
      message: 'Cash payment accepted — order confirmed',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
