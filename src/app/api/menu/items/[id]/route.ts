import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, MenuItem } from '@/data/menu-data';

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

      const { data: item, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          slug,
          name,
          price,
          description,
          image_url,
          is_popular,
          badge,
          caffeine,
          calories,
          is_available,
          is_customizable,
          display_order,
          categories (
            slug
          )
        `)
        .or(`slug.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (!error && item) {
        const menuItem: MenuItem = {
          id: item.slug || item.id,
          name: item.name,
          category: (item.categories as any)?.slug || 'all',
          price: Number(item.price),
          description: item.description,
          image: item.image_url,
          popular: item.is_popular,
          badge: item.badge || '',
          caffeine: item.caffeine || '',
          calories: item.calories || '',
          available: item.is_available,
          customizable: item.is_customizable,
        };

        return NextResponse.json({ item: menuItem });
      }
    }

    // Fallback: search static MENU_DATA.items by ID or name
    const found = MENU_DATA.items.find(
      (i) => i.id === id || i.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()
    );

    if (found) {
      return NextResponse.json({ item: found });
    }

    return NextResponse.json(
      { error: `Menu item '${id}' not found` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
