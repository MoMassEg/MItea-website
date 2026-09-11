import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getUserLoyaltyCard } from '@/lib/loyalty-service';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view loyalty stamps' },
        { status: 401 }
      );
    }

    const card = await getUserLoyaltyCard(user.id);
    return NextResponse.json({
      success: true,
      loyalty: card,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch loyalty stamps' },
      { status: 500 }
    );
  }
}
