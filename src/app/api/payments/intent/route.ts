import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/order-service';
import { createPaymentIntent, isStripeConfigured } from '@/lib/stripe';
import { createRateLimiter } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth-helpers';

const intentLimiter = createRateLimiter(10, 60 * 1000);

/**
 * POST /api/payments/intent
 * Creates a Stripe PaymentIntent for embedded Stripe Elements (Credit Card / Apple Pay).
 * Body: { orderId: string }
 * Returns: { clientSecret: string; paymentIntentId: string; amount: number }
 */
export async function POST(request: Request) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await intentLimiter.limit(`intent:${ip}`);
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

    // Fetch the order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: `Order '${orderId}' not found` }, { status: 404 });
    }

    // Ownership check — authenticated user must own this order
    const currentUser = await getCurrentUser();
    if (currentUser && order.customer_email) {
      const userEmail = (currentUser.email as string | undefined)?.toLowerCase();
      const orderEmail = order.customer_email.toLowerCase();
      if (userEmail && userEmail !== orderEmail) {
        return NextResponse.json({ error: 'Forbidden: you do not own this order' }, { status: 403 });
      }
    }

    if (!isStripeConfigured()) {
      // Demo mode: return a fake client secret so the UI can still show the form
      return NextResponse.json({
        clientSecret: `demo_pi_${Date.now()}_secret_demo`,
        paymentIntentId: `demo_pi_${Date.now()}`,
        amount: Number(order.total ?? 0),
        demo: true,
      });
    }

    const result = await createPaymentIntent({
      orderId: order.id,
      orderNumber: order.order_number,
      customerEmail: order.customer_email ?? '',
      amount: Number(order.total ?? 0),
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create Stripe PaymentIntent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      amount: Number(order.total ?? 0),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
