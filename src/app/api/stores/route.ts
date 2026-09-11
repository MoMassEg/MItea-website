import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, StoreLocation } from '@/data/menu-data';
import { computeStoreStatus } from '@/lib/store-helpers';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (!isPlaceholder) {
      const supabase = await createServerClient();
      const { data: dbStores, error } = await supabase
        .from('stores')
        .select('*')
        .order('is_flagship', { ascending: false });

      if (!error && dbStores && dbStores.length > 0) {
        const stores: StoreLocation[] = dbStores.map((st) => {
          const status = computeStoreStatus(
            st.is_open,
            st.opening_time,
            st.closing_time,
            st.accepts_orders
          );

          return {
            id: st.id,
            name: st.name,
            address: st.address,
            shortAddress: st.short_address,
            city: st.city,
            state: st.state,
            zip: st.zip,
            distance: `${st.city}, ${st.state}`,
            phone: st.phone,
            isOpen: status.isOpen,
            openStatus: status.openStatus,
            closingTime: st.closing_time,
            pickupTime: st.pickup_time_estimate,
            deliveryTime: st.delivery_time_estimate,
            isNearest: true,
            isFlagship: st.is_flagship,
            acceptingOrders: st.accepts_orders,
          };
        });

        return NextResponse.json({ stores });
      }
    }

    // Fallback to local MENU_DATA.stores with calculated live status
    const fallbackStores: StoreLocation[] = MENU_DATA.stores.map((st) => {
      const status = computeStoreStatus(
        st.isOpen,
        '10:00 AM',
        st.closingTime,
        st.acceptingOrders
      );

      return {
        ...st,
        isOpen: status.isOpen,
        openStatus: status.openStatus,
      };
    });

    return NextResponse.json({ stores: fallbackStores });
  } catch (err: any) {
    return NextResponse.json(
      { stores: MENU_DATA.stores },
      { status: 200 }
    );
  }
}
