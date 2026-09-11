import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redeemReward } from '@/lib/loyalty-service';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to redeem loyalty reward' },
        { status: 401 }
      );
    }

    const result = await redeemReward(user.id);
    return NextResponse.json(result);
  } catch (err: any) {
    const isClientError = err.message.includes('Insufficient stamps');
    return NextResponse.json(
      { error: err.message || 'Failed to redeem loyalty reward' },
      { status: isClientError ? 400 : 500 }
    );
  }
}
