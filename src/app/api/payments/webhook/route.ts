import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe';
import { updateOrderStatus, getOrderById } from '@/lib/order-service';
import { sendOrderConfirmation } from '@/lib/email';

// IMPORTANT: Stripe webhook must receive raw body, not parsed JSON.
// Next.js App Router uses the Web Streams API, so we read the raw bytes from the request.
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let body: Buffer;
  try {
    const arrayBuffer = await request.arrayBuffer();
    body = Buffer.from(arrayBuffer);
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  // Construct and verify the Stripe event
  const event = await constructWebhookEvent(body, signature);

  if (!event) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const isConfigured = webhookSecret && !webhookSecret.includes('placeholder');

    if (!isConfigured) {
      if (process.env.NODE_ENV === 'production') {
        // Never skip signature verification in production
        return NextResponse.json(
          { error: 'Webhook not configured — STRIPE_WEBHOOK_SECRET must be set in production' },
          { status: 500 }
        );
      }
      // Dev/demo mode: accept without verification
      console.warn('[Webhook] Stripe not configured — skipping signature check (dev/demo mode)');
    } else {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
  }

  // Process the event
  const stripeEvent = event as Stripe.Event | null;
  const eventType = stripeEvent?.type;

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = stripeEvent!.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('[Webhook] checkout.session.completed — missing orderId in metadata');
          break;
        }

        const updatedOrder = await updateOrderStatus(orderId, 'CONFIRMED', 'PAID');
        console.log(`[Webhook] Order ${orderId} → CONFIRMED (payment completed)`);

        // Fire-and-forget confirmation email — never blocks the webhook response
        if (updatedOrder) {
          const fullOrder = await getOrderById(orderId).catch(() => null);
          sendOrderConfirmation(fullOrder ?? updatedOrder);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent!.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.warn('[Webhook] payment_intent.succeeded — missing orderId in metadata');
          break;
        }

        const updatedOrder = await updateOrderStatus(orderId, 'CONFIRMED', 'PAID');
        console.log(`[Webhook] Order ${orderId} → CONFIRMED (PaymentIntent succeeded)`);

        if (updatedOrder) {
          const fullOrder = await getOrderById(orderId).catch(() => null);
          sendOrderConfirmation(fullOrder ?? updatedOrder);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent!.data.object as Stripe.PaymentIntent;
        // Try to find orderId from metadata (set on the session/payment intent)
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.warn('[Webhook] payment_intent.payment_failed — no orderId in metadata, skipping');
          break;
        }

        await updateOrderStatus(orderId, 'PAYMENT_FAILED', 'FAILED');
        console.log(`[Webhook] Order ${orderId} → PAYMENT_FAILED`);
        break;
      }

      case 'checkout.session.expired': {
        const session = stripeEvent!.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await updateOrderStatus(orderId, 'PAYMENT_FAILED', 'FAILED');
          console.log(`[Webhook] Order ${orderId} → PAYMENT_FAILED (session expired)`);
        }
        break;
      }

      default:
        // Unhandled event type — log and return 200 so Stripe stops retrying
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }
  } catch (err) {
    console.error('[Webhook] Error processing event:', err);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
