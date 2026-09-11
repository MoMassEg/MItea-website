import { NextResponse } from 'next/server';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';
import {
  getAllPromoCodes,
  createPromoCode,
  togglePromoCodeActive,
  deletePromoCode,
} from '@/lib/promo-service';

async function checkAdmin(request: Request) {
  try {
    await requireAdmin(request);
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function GET(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const promos = await getAllPromoCodes();
    return NextResponse.json({ success: true, promos });
  } catch (error: any) {
    console.error('[AdminPromos] Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { code, discount_percent, free_delivery, description, min_order_amount } = body;

    if (!code || typeof discount_percent !== 'number') {
      return NextResponse.json(
        { error: 'Code and valid discount percentage are required' },
        { status: 400 }
      );
    }

    const promo = await createPromoCode({
      code,
      discount_percent,
      free_delivery: Boolean(free_delivery),
      description,
      min_order_amount: Number(min_order_amount) || 0,
    });

    return NextResponse.json({ success: true, promo }, { status: 201 });
  } catch (error: any) {
    console.error('[AdminPromos] Error creating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'id and is_active boolean are required' },
        { status: 400 }
      );
    }

    const updated = await togglePromoCodeActive(id, is_active);
    if (!updated) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, promo: updated });
  } catch (error: any) {
    console.error('[AdminPromos] Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Query parameter ?id=... is required' }, { status: 400 });
    }

    const success = await deletePromoCode(id);
    return NextResponse.json({ success, message: success ? 'Promo deleted' : 'Promo not found' });
  } catch (error: any) {
    console.error('[AdminPromos] Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code', details: error?.message },
      { status: 500 }
    );
  }
}
