import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAddressSchema } from '@/lib/validators/store';
import { validateDeliveryAddress } from '@/lib/store-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateAddressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid address information',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { address, city, state, zip, storeId } = parsed.data;

    let deliveryRadius = 5.0;

    // If storeId is provided and Supabase is configured, lookup store's radius
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (storeId && !isPlaceholder) {
      try {
        const supabase = await createServerClient();
        const { data: store } = await supabase
          .from('stores')
          .select('delivery_radius_miles')
          .eq('id', storeId)
          .maybeSingle();

        if (store?.delivery_radius_miles) {
          deliveryRadius = store.delivery_radius_miles;
        }
      } catch {
        // Continue with default radius
      }
    }

    const validationResult = validateDeliveryAddress(
      address,
      city,
      state,
      zip,
      deliveryRadius
    );

    const full = `${address}, ${city}, ${state} ${zip}`;
    const formattedCity = `${city}, ${state} ${zip}`;

    return NextResponse.json({
      valid: validationResult.valid,
      distance: validationResult.distance,
      estimatedTime: validationResult.estimatedTime,
      deliveryFee: validationResult.deliveryFee,
      reason: validationResult.reason,
      address: {
        full,
        street: address,
        city: formattedCity,
        valid: validationResult.valid,
        estTime: validationResult.estimatedTime,
        distance: validationResult.distance,
        reason: validationResult.reason,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        valid: false,
        error: err.message || 'Failed to validate address',
      },
      { status: 500 }
    );
  }
}
