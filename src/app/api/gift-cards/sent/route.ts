import { NextResponse } from 'next/server';
import { getUserSentGiftCards } from '@/lib/gift-card-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view sent gift cards' },
        { status: 401 }
      );
    }

    const giftCards = await getUserSentGiftCards(user.id);
    return NextResponse.json({
      success: true,
      giftCards,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch sent gift cards' },
      { status: 500 }
    );
  }
}
