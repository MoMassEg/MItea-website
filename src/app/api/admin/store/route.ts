import { NextResponse } from 'next/server';
import { requireAdmin, AuthError, ForbiddenError } from '@/lib/auth-helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/dev-auth';
import { MENU_DATA } from '@/data/menu-data';

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
    if (isSupabaseConfigured()) {
      try {
        const db = createAdminClient();
        const { data, error } = await db.from('stores').select('*').limit(1).maybeSingle();
        if (!error && data) {
          return NextResponse.json({ success: true, store: data });
        }
      } catch (err) {
        console.warn('[AdminStore] Supabase query failed:', err);
      }
    }

    const fallback = MENU_DATA.stores[0];
    return NextResponse.json({
      success: true,
      store: {
        id: fallback.id,
        name: fallback.name,
        address: fallback.address,
        phone: fallback.phone,
        is_open: fallback.isOpen,
        accepts_orders: fallback.acceptingOrders,
        pickup_time_estimate: fallback.pickupTime,
        delivery_time_estimate: fallback.deliveryTime,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch store settings', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authErr = await checkAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { is_open, accepts_orders, pickup_time_estimate, delivery_time_estimate, phone } = body;

    if (isSupabaseConfigured()) {
      try {
        const db = createAdminClient();
        const updatePayload: Record<string, any> = {};
        if (is_open !== undefined) updatePayload.is_open = is_open;
        if (accepts_orders !== undefined) updatePayload.accepts_orders = accepts_orders;
        if (pickup_time_estimate !== undefined) updatePayload.pickup_time_estimate = pickup_time_estimate;
        if (delivery_time_estimate !== undefined) updatePayload.delivery_time_estimate = delivery_time_estimate;
        if (phone !== undefined) updatePayload.phone = phone;

        const { data: firstStore } = await db.from('stores').select('id').limit(1).maybeSingle();
        if (firstStore) {
          const { data, error } = await db
            .from('stores')
            .update(updatePayload as any)
            .eq('id', firstStore.id)
            .select()
            .single();

          if (!error && data) {
            return NextResponse.json({ success: true, store: data });
          }
        }
      } catch (err) {
        console.warn('[AdminStore] DB update failed, falling back:', err);
      }
    }

    // In-memory fallback
    const target = MENU_DATA.stores[0];
    if (is_open !== undefined) target.isOpen = is_open;
    if (accepts_orders !== undefined) target.acceptingOrders = accepts_orders;
    if (pickup_time_estimate !== undefined) target.pickupTime = pickup_time_estimate;
    if (delivery_time_estimate !== undefined) target.deliveryTime = delivery_time_estimate;
    if (phone !== undefined) target.phone = phone;

    return NextResponse.json({
      success: true,
      store: {
        id: target.id,
        name: target.name,
        address: target.address,
        phone: target.phone,
        is_open: target.isOpen,
        accepts_orders: target.acceptingOrders,
        pickup_time_estimate: target.pickupTime,
        delivery_time_estimate: target.deliveryTime,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update store settings', details: error?.message },
      { status: 500 }
    );
  }
}
