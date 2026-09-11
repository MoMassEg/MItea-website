import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, StoreLocation } from '@/data/menu-data';
import { computeStoreStatus } from '@/lib/store-helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (!isPlaceholder) {
      const supabase = await createServerClient();

      // Check if id is a valid UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase.from('stores').select('*');
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.or(`name.ilike.%${id}%,city.ilike.%${id}%`);
      }

      const { data: store, error } = await query.maybeSingle();

      if (!error && store) {
        const status = computeStoreStatus(
          store.is_open,
          store.opening_time,
          store.closing_time,
          store.accepts_orders
        );

        const storeLocation: StoreLocation = {
          id: store.id,
          name: store.name,
          address: store.address,
          shortAddress: store.short_address,
          city: store.city,
          state: store.state,
          zip: store.zip,
          distance: `${store.city}, ${store.state}`,
          phone: store.phone,
          isOpen: status.isOpen,
          openStatus: status.openStatus,
          closingTime: store.closing_time,
          pickupTime: store.pickup_time_estimate,
          deliveryTime: store.delivery_time_estimate,
          isNearest: true,
          isFlagship: store.is_flagship,
          acceptingOrders: store.accepts_orders,
        };

        return NextResponse.json({ store: storeLocation });
      }
    }

    // Fallback search in MENU_DATA.stores
    const found = MENU_DATA.stores.find(
      (st) =>
        st.id === id ||
        st.name.toLowerCase().includes(id.toLowerCase()) ||
        st.city.toLowerCase().includes(id.toLowerCase())
    );

    if (found) {
      const status = computeStoreStatus(
        found.isOpen,
        '10:00 AM',
        found.closingTime,
        found.acceptingOrders
      );

      return NextResponse.json({
        store: {
          ...found,
          isOpen: status.isOpen,
          openStatus: status.openStatus,
        },
      });
    }

    return NextResponse.json(
      { error: `Store '${id}' not found` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
