import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MENU_DATA, MenuItem } from '@/data/menu-data';
import { menuQuerySchema } from '@/lib/validators/menu';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = {
      category: searchParams.get('category') || undefined,
      popular: searchParams.get('popular') || undefined,
      available: searchParams.get('available') || undefined,
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const parsed = menuQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { category, popular, available, q, limit, offset } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (!isPlaceholder) {
      const supabase = await createServerClient();

      // Resolve category slug or ID to category UUID if provided
      let categoryId: string | null = null;
      if (category && category !== 'all') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
        const { data: catData } = isUuid
          ? await supabase.from('categories').select('id').eq('id', category).maybeSingle()
          : await supabase.from('categories').select('id').eq('slug', category).maybeSingle();

        if (catData) {
          categoryId = catData.id;
        }
      }

      let query = supabase
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
        `, { count: 'exact' });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (typeof popular === 'boolean') {
        query = query.eq('is_popular', popular);
      }

      if (typeof available === 'boolean') {
        query = query.eq('is_available', available);
      }

      if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      query = query
        .order('display_order', { ascending: true })
        .range(offset, offset + limit - 1);

      const { data: dbItems, error, count } = await query;

      if (!error && dbItems && dbItems.length > 0) {
        const items: MenuItem[] = dbItems.map((item: any) => ({
          id: item.slug || item.id,
          name: item.name,
          category: item.categories?.slug || 'all',
          price: Number(item.price),
          description: item.description,
          image: item.image_url,
          popular: item.is_popular,
          badge: item.badge || '',
          caffeine: item.caffeine || '',
          calories: item.calories || '',
          available: item.is_available,
          customizable: item.is_customizable,
        }));

        return NextResponse.json({
          items,
          total: count ?? items.length,
          limit,
          offset,
        });
      }
    }

    // Fallback: Filter static MENU_DATA.items in memory
    let filtered = [...MENU_DATA.items];

    if (category && category !== 'all') {
      filtered = filtered.filter((i) => i.category === category);
    }

    if (typeof popular === 'boolean') {
      filtered = filtered.filter((i) => i.popular === popular);
    }

    if (typeof available === 'boolean') {
      filtered = filtered.filter((i) => i.available === available);
    }

    if (q) {
      const queryLower = q.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(queryLower) ||
          i.description.toLowerCase().includes(queryLower) ||
          i.badge.toLowerCase().includes(queryLower)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      items: paginated,
      total,
      limit,
      offset,
    });
  } catch (err: any) {
    return NextResponse.json(
      { items: MENU_DATA.items, total: MENU_DATA.items.length },
      { status: 200 }
    );
  }
}
