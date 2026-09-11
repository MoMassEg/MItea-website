import { NextResponse } from 'next/server';
import { validatePromoSchema } from '@/lib/validators/promo';
import { checkPromoCode } from '@/lib/promo-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validatePromoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          valid: false,
          reason: parsed.error.issues[0]?.message || 'Invalid input format',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;
    const result = await checkPromoCode(code, subtotal);

    if (!result.valid) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        valid: false,
        reason: err.message || 'Failed to process promo code',
      },
      { status: 500 }
    );
  }
}
