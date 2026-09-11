import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, CustomizationPresets } from '@/data/menu-data';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (!isPlaceholder) {
      const supabase = await createServerClient();

      const { data: dbPresets, error } = await supabase
        .from('customization_presets')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && dbPresets && dbPresets.length > 0) {
        const customizations: CustomizationPresets = {
          sugarLevels: dbPresets
            .filter((p) => p.type === 'sugar')
            .map((p) => ({
              label: p.label,
              value: p.value,
              desc: p.name,
              isDefault: p.is_default,
            })),
          iceLevels: dbPresets
            .filter((p) => p.type === 'ice')
            .map((p) => ({
              label: p.label,
              value: p.value,
              desc: p.name,
              isDefault: p.is_default,
            })),
          sizes: dbPresets
            .filter((p) => p.type === 'size')
            .map((p) => ({
              label: p.label,
              value: p.value,
              priceModifier: Number(p.price_delta),
              isDefault: p.is_default,
            })),
          toppings: dbPresets
            .filter((p) => p.type === 'topping')
            .map((p) => ({
              id: p.value,
              name: p.name,
              price: Number(p.price_delta),
              calories: 80,
              defaultSelected: p.is_default,
            })),
        };

        return NextResponse.json({ customizations });
      }
    }

    // Fallback to static presets
    return NextResponse.json({
      customizations: MENU_DATA.customizationPresets,
    });
  } catch (err: any) {
    return NextResponse.json(
      { customizations: MENU_DATA.customizationPresets },
      { status: 200 }
    );
  }
}
