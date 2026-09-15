/**
 * One-off fix: sync menu data with the printed menu boards.
 * 1. Add missing "Chizu Taro Latte" $7.25 (No Caffeine Series)
 * 2. Correct "Strawberry Mango" price $8.25 -> $7.25
 * Run: node scripts/fix-menu-items.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

// Load .env manually (no dotenv dependency needed)
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const envVars = {};
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || url.includes('placeholder')) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// 1. Resolve no-caffeine category id
const { data: cat, error: catErr } = await db
  .from('categories')
  .select('id, name')
  .eq('slug', 'no-caffeine')
  .maybeSingle();
if (catErr || !cat) {
  console.error('no-caffeine category not found:', catErr?.message);
  process.exit(1);
}
console.log('no-caffeine category:', cat.id);

// 2. Insert missing Chizu Taro Latte (decaf, $7.25) if not present
const { data: existing } = await db
  .from('menu_items')
  .select('id, name, price')
  .eq('name', 'Chizu Taro Latte')
  .eq('category_id', cat.id)
  .maybeSingle();

if (existing) {
  console.log('Chizu Taro Latte already exists in no-caffeine:', existing.id);
} else {
  // Reuse the existing chizu taro latte image if available
  const { data: imgRef } = await db
    .from('menu_items')
    .select('image_url, display_order')
    .eq('slug', 'chizu-taro-latte')
    .maybeSingle();

  const { data: inserted, error: insErr } = await db
    .from('menu_items')
    .insert({
      slug: 'chizu-taro-latte-no-caffeine',
      category_id: cat.id,
      name: 'Chizu Taro Latte',
      price: 7.25,
      description:
        'Your favorite taro latte with our housemade sweet cream. **Contains milk** **Contains no caffeine**',
      image_url: imgRef?.image_url || '',
      is_popular: false,
      caffeine: 'None',
      is_available: true,
      is_customizable: true,
      display_order: (imgRef?.display_order ?? 0) + 1,
    })
    .select('id')
    .single();
  if (insErr) {
    console.error('Insert failed:', insErr.message);
    process.exit(1);
  }
  console.log('Inserted Chizu Taro Latte (no-caffeine) $7.25:', inserted.id);
}

// 3. Fix Strawberry Mango price to $7.25
const { data: sm, error: smErr } = await db
  .from('menu_items')
  .update({ price: 7.25 })
  .eq('slug', 'strawberry-mango')
  .select('id, name, price');
if (smErr) {
  console.error('Strawberry Mango update failed:', smErr.message);
  process.exit(1);
}
console.log('Strawberry Mango updated:', sm);
console.log('DONE');
