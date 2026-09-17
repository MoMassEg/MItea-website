import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/order-service';
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';
import { createRateLimiter } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth-helpers';

const checkoutLimiter = createRateLimiter(10, 60 * 1000); // 10 requests per minute per IP

export async function POST(request: Request) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await checkoutLimiter.limit(`checkout:${ip}`);
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
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: `Order '${orderId}' not found` },
        { status: 404 }
      );
    }

    // Ownership check — if a user is authenticated, they must own this order
    const currentUser = await getCurrentUser();
    if (currentUser && order.customer_email) {
      const userEmail = (currentUser.email as string | undefined)?.toLowerCase();
      const orderEmail = order.customer_email.toLowerCase();
      if (userEmail && userEmail !== orderEmail) {
        return NextResponse.json(
          { error: 'Forbidden: you do not own this order' },
          { status: 403 }
        );
      }
    }

    if (!isStripeConfigured()) {
      // Demo mode: return a fake checkout URL
      return NextResponse.json({
        checkoutUrl: `/?demo_checkout=true&orderId=${orderId}&orderNumber=${order.order_number}`,
        sessionId: `demo_session_${Date.now()}`,
        demo: true,
      });
    }

    const items = (order.items || []).map((item: any) => ({
      name: item.name,
      description: [
        item.size && item.size !== 'Standard' ? item.size : undefined,
        item.sugar_level ? `Sugar: ${item.sugar_level}` : undefined,
        item.ice_level ? `Ice: ${item.ice_level}` : undefined,
        item.notes ? `Notes: ${item.notes}` : undefined,
      ]
        .filter(Boolean)
        .join(' · '),
      unitPrice: Number(item.unit_price ?? item.unitPrice),
      quantity: Number(item.quantity),
    }));

    const result = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      items,
      deliveryFee: Number(order.delivery_fee ?? 0),
      discount: Number(order.discount_amount ?? order.discount ?? 0),
      tax: Number(order.tax_amount ?? order.tax ?? 0),
      tip: Number(order.tip_amount ?? order.tip ?? 0),
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create Stripe checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: result.url,
      sessionId: result.sessionId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

