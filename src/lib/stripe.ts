import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('placeholder') || secretKey.startsWith('sk_test_placeholder')) {
    return null;
  }
  if (!_stripe) {
    _stripe = new Stripe(secretKey, {
      apiVersion: '2026-08-26.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return getStripe() !== null;
}

export function getWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes('placeholder')) return null;
  return secret;
}

export interface CreatePaymentIntentInput {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  amount: number; // in dollars — will be converted to cents
  currency?: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const { orderId, orderNumber, customerEmail, amount, currency = 'usd', metadata = {} } = input;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.max(50, Math.round(amount * 100)), // cents (min 50 cents)
    currency,
    receipt_email: customerEmail || undefined,
    metadata: {
      orderId,
      orderNumber,
      ...metadata,
    },
    // Allow all payment method types that Stripe can auto-detect (card, Apple Pay, etc.)
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export interface CreateCheckoutSessionInput {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  items: Array<{
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
  }>;
  deliveryFee: number;
  discount: number;
  tax: number;
  tip: number;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ url: string; sessionId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const {
    orderId,
    orderNumber,
    customerEmail,
    items,
    deliveryFee,
    discount,
    tax,
    tip,
    metadata = {},
  } = input;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description,
      },
      unit_amount: Math.round(item.unitPrice * 100), // cents
    },
    quantity: item.quantity,
  }));

  // Add delivery fee as line item if applicable
  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Delivery Fee' },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });
  }

  // Add tax as line item
  if (tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Sales Tax (MN 8.025%)' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });
  }

  // Add tip if any
  if (tip > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tip' },
        unit_amount: Math.round(tip * 100),
      },
      quantity: 1,
    });
  }

  // Subtract discount as a negative item
  if (discount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `Promo Discount` },
        unit_amount: -Math.round(discount * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    line_items: lineItems,
    success_url: `${appUrl}/order-confirmation?orderId=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    metadata: {
      orderId,
      orderNumber,
      ...metadata,
    },
  });

  return { url: session.url!, sessionId: session.id };
}

export async function constructWebhookEvent(
  body: Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();
  if (!stripe || !webhookSecret) return null;

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return null;
  }
}
