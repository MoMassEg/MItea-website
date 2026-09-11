import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, Category } from '@/data/menu-data';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (!isPlaceholder) {
      const supabase = await createServerClient();
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('id, slug, name, icon, display_order')
        .order('display_order', { ascending: true });

      if (!error && dbCategories && dbCategories.length > 0) {
        // Fetch counts and popular counts from menu_items
        const { data: items } = await supabase
          .from('menu_items')
          .select('category_id, is_popular');

        const counts = new Map<string, number>();
        let popularCount = 0;
        items?.forEach((item: any) => {
          counts.set(item.category_id, (counts.get(item.category_id) || 0) + 1);
          if (item.is_popular) popularCount++;
        });

        const categories: Category[] = dbCategories.map((c) => ({
          id: c.slug || c.id,
          name: c.name,
          icon: c.icon,
          count: c.slug === 'all' ? popularCount : (counts.get(c.id) || 0),
        }));

        return NextResponse.json({ categories });
      }
    }

    // Fallback to local MENU_DATA
    return NextResponse.json({ categories: MENU_DATA.categories });
  } catch {
    // Graceful fallback to static menu data
    return NextResponse.json({ categories: MENU_DATA.categories });
  }
}
