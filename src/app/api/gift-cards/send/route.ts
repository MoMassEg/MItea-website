import { NextResponse } from 'next/server';
import { sendGiftCardSchema } from '@/lib/validators/gift-card';
import { createAndSendGiftCard } from '@/lib/gift-card-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendGiftCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid gift card parameters',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const giftCard = await createAndSendGiftCard(parsed.data, user?.id);

    return NextResponse.json(
      {
        success: true,
        giftCard,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create and send gift card' },
      { status: 500 }
    );
  }
}
