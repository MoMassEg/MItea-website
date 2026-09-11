import { NextResponse } from 'next/server';
import { redeemGiftCardSchema } from '@/lib/validators/gift-card';
import { redeemGiftCard } from '@/lib/gift-card-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const parsed = redeemGiftCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid redemption parameters',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const result = await redeemGiftCard(code, parsed.data.amount, user?.id);

    return NextResponse.json(result);
  } catch (err: any) {
    const isClientError =
      err.message.includes('not found') ||
      err.message.includes('already been fully redeemed') ||
      err.message.includes('exceeds available balance') ||
      err.message.includes('greater than 0');

    return NextResponse.json(
      { error: err.message || 'Failed to redeem gift card' },
      { status: isClientError ? 400 : 500 }
    );
  }
}
