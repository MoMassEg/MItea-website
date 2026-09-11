import { createAdminClient } from '@/lib/supabase/admin';
import { MENU_DATA, MenuItem } from '@/data/menu-data';
import { CreateMenuItemInput, UpdateMenuItemInput } from '@/lib/validators/admin-menu';

// In-memory store initialized with MENU_DATA.items for offline / demo mode
const inMemoryMenuItems = new Map<string, MenuItem>();

function initInMemoryStore() {
  if (inMemoryMenuItems.size === 0) {
    MENU_DATA.items.forEach((item) => {
      inMemoryMenuItems.set(item.id, { ...item });
    });
  }
}

initInMemoryStore();

function isDbEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !(!url || url.includes('placeholder'));
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
  initInMemoryStore();

  const id = generateId();
  const slug = slugify(input.name);

  const item: MenuItem = {
    id,
    name: input.name,
    category: input.category,
    price: Number(input.price.toFixed(2)),
    description: input.description || '',
    image: input.image || '/images/drinks/classic-milk-tea.webp',
    popular: input.popular ?? false,
    badge: input.badge || '',
    caffeine: input.caffeine || 'Medium',
    calories: input.calories || '220 kcal',
    available: input.available ?? true,
    customizable: input.customizable ?? true,
  };

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();

      let categoryUuid = input.category;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryUuid)) {
        const { data: cat } = await db
          .from('categories')
          .select('id')
          .eq('slug', input.category)
          .maybeSingle();
        if (cat) categoryUuid = cat.id;
      }

      await db.from('menu_items').insert({
        id,
        category_id: categoryUuid,
        name: input.name,
        slug,
        description: input.description || '',
        price: item.price,
        image_url: item.image,
        is_popular: item.popular,
        badge: item.badge,
        caffeine: item.caffeine,
        calories: input.calories || '220 kcal',
        is_available: item.available,
        is_customizable: item.customizable,
      });
    } catch (err) {
      console.warn('[MenuService] DB insert failed, using in-memory store:', err);
    }
  }

  inMemoryMenuItems.set(id, item);
  return item;
}

export async function updateMenuItem(input: UpdateMenuItemInput): Promise<MenuItem | null> {
  initInMemoryStore();

  const existing = inMemoryMenuItems.get(input.id);
  if (!existing && !isDbEnabled()) {
    return null;
  }

  const updated: MenuItem = {
    ...(existing || {
      id: input.id,
      name: input.name || 'Item',
      category: input.category || 'milk-tea',
      price: input.price || 5.5,
      description: input.description || '',
      image: input.image || '/images/drinks/classic-milk-tea.webp',
      popular: input.popular || false,
      badge: input.badge || '',
      caffeine: input.caffeine || 'Medium',
      calories: input.calories || '220 kcal',
      available: input.available ?? true,
      customizable: input.customizable ?? true,
    }),
    ...(input.name !== undefined && { name: input.name }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.price !== undefined && { price: Number(input.price.toFixed(2)) }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.image !== undefined && { image: input.image }),
    ...(input.popular !== undefined && { popular: input.popular }),
    ...(input.badge !== undefined && { badge: input.badge }),
    ...(input.caffeine !== undefined && { caffeine: input.caffeine }),
    ...(input.calories !== undefined && { calories: input.calories }),
    ...(input.available !== undefined && { available: input.available }),
    ...(input.customizable !== undefined && { customizable: input.customizable }),
  };

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const updatePayload: Record<string, any> = {};

      if (input.name !== undefined) updatePayload.name = input.name;
      if (input.description !== undefined) updatePayload.description = input.description;
      if (input.price !== undefined) updatePayload.price = Number(input.price.toFixed(2));
      if (input.image !== undefined) updatePayload.image_url = input.image;
      if (input.popular !== undefined) updatePayload.is_popular = input.popular;
      if (input.badge !== undefined) updatePayload.badge = input.badge;
      if (input.caffeine !== undefined) updatePayload.caffeine = input.caffeine;
      if (input.calories !== undefined) updatePayload.calories = input.calories;
      if (input.available !== undefined) updatePayload.is_available = input.available;
      if (input.customizable !== undefined) updatePayload.is_customizable = input.customizable;

      await db.from('menu_items').update(updatePayload as any).eq('id', input.id);
    } catch (err) {
      console.warn('[MenuService] DB update failed:', err);
    }
  }

  inMemoryMenuItems.set(input.id, updated);
  return updated;
}

export async function deactivateMenuItem(id: string): Promise<boolean> {
  initInMemoryStore();

  const item = inMemoryMenuItems.get(id);
  if (item) {
    item.available = false;
    inMemoryMenuItems.set(id, item);
  }

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db.from('menu_items').update({ is_available: false }).eq('id', id);
      return true;
    } catch (err) {
      console.warn('[MenuService] DB deactivate failed:', err);
    }
  }

  return !!item;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  initInMemoryStore();

  const had = inMemoryMenuItems.delete(id);

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db.from('menu_items').delete().eq('id', id);
      return true;
    } catch (err) {
      console.warn('[MenuService] DB delete failed:', err);
    }
  }

  return had;
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  initInMemoryStore();

  if (inMemoryMenuItems.has(id)) {
    return inMemoryMenuItems.get(id)!;
  }

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data } = await db.from('menu_items').select('*').eq('id', id).maybeSingle();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          category: data.category_id,
          price: Number(data.price),
          description: data.description || '',
          image: data.image_url || '',
          popular: Boolean(data.is_popular),
          badge: data.badge || '',
          caffeine: data.caffeine || 'Medium',
          calories: data.calories || '220 kcal',
          available: Boolean(data.is_available),
          customizable: Boolean(data.is_customizable),
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}
