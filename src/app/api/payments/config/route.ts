import { NextResponse } from 'next/server';

export async function GET() {
  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51UCOlyFhWLJMtlj6wXtpGVscQbF5u5crxDIQgism0HpxLIIirlF5IaK2W4gM8WjfSaH1LVMU2IrcHQCR8fRlLwFt00ZwDtcZJQ';

  return NextResponse.json({
    publishableKey,
    isLive: publishableKey.startsWith('pk_live_'),
  });
}
