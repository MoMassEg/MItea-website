import { NextResponse } from 'next/server';
import { getGiftCardBalance } from '@/lib/gift-card-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const balanceInfo = await getGiftCardBalance(code);

    if (!balanceInfo) {
      return NextResponse.json(
        { error: `Gift card code '${code}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      giftCard: balanceInfo,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to check gift card balance' },
      { status: 500 }
    );
  }
}
