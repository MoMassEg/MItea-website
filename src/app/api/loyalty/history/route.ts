import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getLoyaltyHistory } from '@/lib/loyalty-service';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view loyalty history' },
        { status: 401 }
      );
    }

    const history = await getLoyaltyHistory(user.id);
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch loyalty history' },
      { status: 500 }
    );
  }
}
