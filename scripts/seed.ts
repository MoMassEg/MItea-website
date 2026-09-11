import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { MENU_DATA } from '../src/data/menu-data';

// Load environment variables from .env.local / .env
loadEnvConfig(process.cwd());

const PROMO_CODES = [
  {
    code: 'GUILD10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off your entire order (Guild Member welcome code)',
    min_order_amount: 0,
    is_active: true,
  },
  {
    code: 'FIRSTORDER',
    discount_percent: 15,
    free_delivery: true,
    description: '15% off and free delivery on your first order over $15',
    min_order_amount: 15.0,
    is_active: true,
  },
  {
    code: 'BOBA10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off artisanal boba drinks',
    min_order_amount: 0,
    is_active: true,
  },
  {
    code: 'MITEA10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off your favorite MiTea treats',
    min_order_amount: 0,
    is_active: true,
  },
  {
    code: 'WELCOME10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off welcome discount for new customers',
    min_order_amount: 0,
    is_active: true,
  },
];

// Helper to sanitize text for SQL statements
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function generateSeedSql(): string {
  const lines: string[] = [];
  lines.push('-- =============================================================================');
  lines.push('-- MiTea Online Ordering — Seed Data (Auto-generated from menu-data.ts)');
  lines.push('-- =============================================================================');
  lines.push('');

  // 1. Categories
  lines.push('-- 1. CATEGORIES');
  MENU_DATA.categories.forEach((cat, idx) => {
    lines.push(
      `INSERT INTO public.categories (slug, name, icon, display_order) ` +
      `VALUES ('${escapeSql(cat.id)}', '${escapeSql(cat.name)}', '${escapeSql(cat.icon)}', ${idx}) ` +
      `ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;`
    );
  });
  lines.push('');

  // 2. Customization Presets
  lines.push('-- 2. CUSTOMIZATION PRESETS');
  MENU_DATA.customizationPresets.sugarLevels.forEach((sugar, idx) => {
    lines.push(
      `INSERT INTO public.customization_presets (type, name, label, value, price_delta, is_default, display_order) ` +
      `VALUES ('sugar', '${escapeSql(sugar.desc)}', '${escapeSql(sugar.label)}', '${escapeSql(sugar.value)}', 0.00, ${Boolean(sugar.isDefault)}, ${idx});`
    );
  });
  MENU_DATA.customizationPresets.iceLevels.forEach((ice, idx) => {
    lines.push(
      `INSERT INTO public.customization_presets (type, name, label, value, price_delta, is_default, display_order) ` +
      `VALUES ('ice', '${escapeSql(ice.desc)}', '${escapeSql(ice.label)}', '${escapeSql(ice.value)}', 0.00, ${Boolean(ice.isDefault)}, ${idx});`
    );
  });
  MENU_DATA.customizationPresets.sizes.forEach((size, idx) => {
    lines.push(
      `INSERT INTO public.customization_presets (type, name, label, value, price_delta, is_default, display_order) ` +
      `VALUES ('size', '${escapeSql(size.label)}', '${escapeSql(size.label)}', '${escapeSql(size.value)}', ${size.priceModifier.toFixed(2)}, ${Boolean(size.isDefault)}, ${idx});`
    );
  });
  MENU_DATA.customizationPresets.toppings.forEach((top, idx) => {
    lines.push(
      `INSERT INTO public.customization_presets (type, name, label, value, price_delta, is_default, display_order) ` +
      `VALUES ('topping', '${escapeSql(top.name)}', '${escapeSql(top.name)}', '${escapeSql(top.id)}', ${top.price.toFixed(2)}, ${Boolean(top.defaultSelected)}, ${idx});`
    );
  });
  lines.push('');

  // 3. Store Locations
  lines.push('-- 3. STORES');
  MENU_DATA.stores.forEach((store) => {
    lines.push(
      `INSERT INTO public.stores (name, address, short_address, city, state, zip, phone, latitude, longitude, is_open, opening_time, closing_time, pickup_time_estimate, delivery_time_estimate, is_flagship, accepts_orders, delivery_radius_miles) ` +
      `VALUES ('${escapeSql(store.name)}', '${escapeSql(store.address)}', '${escapeSql(store.shortAddress)}', '${escapeSql(store.city)}', '${escapeSql(store.state)}', '${escapeSql(store.zip)}', '${escapeSql(store.phone)}', 44.9866, -93.3768, ${Boolean(store.isOpen)}, '10:00 AM', '${escapeSql(store.closingTime)}', '${escapeSql(store.pickupTime)}', '30-45 mins', ${Boolean(store.isFlagship)}, ${Boolean(store.acceptingOrders)}, 5.0);`
    );
  });
  lines.push('');

  // 4. Promo Codes
  lines.push('-- 4. PROMO CODES');
  PROMO_CODES.forEach((promo) => {
    lines.push(
      `INSERT INTO public.promo_codes (code, discount_percent, free_delivery, description, min_order_amount, is_active) ` +
      `VALUES ('${escapeSql(promo.code)}', ${promo.discount_percent}, ${promo.free_delivery}, '${escapeSql(promo.description)}', ${promo.min_order_amount.toFixed(2)}, ${promo.is_active}) ` +
      `ON CONFLICT (code) DO UPDATE SET discount_percent = EXCLUDED.discount_percent, description = EXCLUDED.description;`
    );
  });
  lines.push('');

  // 5. Menu Items
  lines.push('-- 5. MENU ITEMS');
  MENU_DATA.items.forEach((item, idx) => {
    const badgeVal = item.badge ? `'${escapeSql(item.badge)}'` : 'NULL';
    const caffeineVal = item.caffeine ? `'${escapeSql(item.caffeine)}'` : 'NULL';
    const caloriesVal = item.calories ? `'${escapeSql(item.calories)}'` : 'NULL';

    lines.push(
      `INSERT INTO public.menu_items (slug, category_id, name, price, description, image_url, is_popular, badge, caffeine, calories, is_available, is_customizable, display_order) ` +
      `SELECT '${escapeSql(item.id)}', id, '${escapeSql(item.name)}', ${item.price.toFixed(2)}, '${escapeSql(item.description)}', '${escapeSql(item.image)}', ${Boolean(item.popular)}, ${badgeVal}, ${caffeineVal}, ${caloriesVal}, ${Boolean(item.available)}, ${Boolean(item.customizable)}, ${idx} ` +
      `FROM public.categories WHERE slug = '${escapeSql(item.category)}' ` +
      `ON CONFLICT (slug) DO UPDATE SET ` +
      `name = EXCLUDED.name, price = EXCLUDED.price, description = EXCLUDED.description, image_url = EXCLUDED.image_url, is_popular = EXCLUDED.is_popular, badge = EXCLUDED.badge, caffeine = EXCLUDED.caffeine, calories = EXCLUDED.calories, is_available = EXCLUDED.is_available, is_customizable = EXCLUDED.is_customizable, display_order = EXCLUDED.display_order;`
    );
  });
  lines.push('');

  return lines.join('\n');
}

async function runSeed() {
  console.log('🌱 Starting MiTea Database Seed Process...\n');

  // 1. Export static seed.sql for instant Supabase Dashboard execution
  const sqlContent = generateSeedSql();
  const seedSqlPath = path.join(process.cwd(), 'supabase', 'seed.sql');
  fs.writeFileSync(seedSqlPath, sqlContent, 'utf8');
  console.log(`✅ Generated static SQL seed file at: ${seedSqlPath}`);

  // 2. Check if active Supabase connection credentials exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  const isPlaceholder =
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes('placeholder') ||
    serviceRoleKey.includes('placeholder');

  if (isPlaceholder) {
    console.log('\n⚠️  Supabase environment keys in .env.local are currently using placeholder values.');
    console.log('   - To seed a live Supabase project automatically:');
    console.log('     1. Open .env.local');
    console.log('     2. Replace NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY with your project keys');
    console.log('     3. Re-run: npm run db:seed\n');
    console.log('   - Or simply paste supabase/seed.sql directly into your Supabase SQL Editor.\n');
    console.log('📊 Verified Dataset Ready For Seeding:');
    console.log(`   • Categories: ${MENU_DATA.categories.length}`);
    console.log(`   • Menu Items: ${MENU_DATA.items.length}`);
    console.log(
      `   • Customization Presets: ${
        MENU_DATA.customizationPresets.sugarLevels.length +
        MENU_DATA.customizationPresets.iceLevels.length +
        MENU_DATA.customizationPresets.sizes.length +
        MENU_DATA.customizationPresets.toppings.length
      } (sugar: ${MENU_DATA.customizationPresets.sugarLevels.length}, ice: ${MENU_DATA.customizationPresets.iceLevels.length}, sizes: ${MENU_DATA.customizationPresets.sizes.length}, toppings: ${MENU_DATA.customizationPresets.toppings.length})`
    );
    console.log(`   • Stores: ${MENU_DATA.stores.length}`);
    console.log(`   • Promo Codes: ${PROMO_CODES.length}`);
    console.log('\n🎉 Seed data preparation completed successfully!');
    return;
  }

  // 3. Connect to Supabase via Admin Client
  console.log(`🔗 Connecting to Supabase project at ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // --- Seed Categories ---
    console.log(`📦 Seeding ${MENU_DATA.categories.length} categories...`);
    const categoryRecords = MENU_DATA.categories.map((cat, idx) => ({
      slug: cat.id,
      name: cat.name,
      icon: cat.icon,
      display_order: idx,
    }));

    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .upsert(categoryRecords, { onConflict: 'slug' })
      .select('id, slug');

    if (catError) throw new Error(`Failed to seed categories: ${catError.message}`);
    console.log(`✅ Categories seeded successfully!`);

    const categoryMap = new Map<string, string>();
    insertedCategories?.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id);
    });

    // --- Seed Customization Presets ---
    console.log(`📦 Seeding customization presets...`);
    const presets: Array<{
      type: 'sugar' | 'ice' | 'size' | 'topping';
      name: string;
      label: string;
      value: string;
      price_delta: number;
      is_default: boolean;
      display_order: number;
    }> = [];

    MENU_DATA.customizationPresets.sugarLevels.forEach((s, idx) => {
      presets.push({
        type: 'sugar',
        name: s.desc,
        label: s.label,
        value: s.value,
        price_delta: 0,
        is_default: Boolean(s.isDefault),
        display_order: idx,
      });
    });

    MENU_DATA.customizationPresets.iceLevels.forEach((i, idx) => {
      presets.push({
        type: 'ice',
        name: i.desc,
        label: i.label,
        value: i.value,
        price_delta: 0,
        is_default: Boolean(i.isDefault),
        display_order: idx,
      });
    });

    MENU_DATA.customizationPresets.sizes.forEach((sz, idx) => {
      presets.push({
        type: 'size',
        name: sz.label,
        label: sz.label,
        value: sz.value,
        price_delta: sz.priceModifier,
        is_default: Boolean(sz.isDefault),
        display_order: idx,
      });
    });

    MENU_DATA.customizationPresets.toppings.forEach((t, idx) => {
      presets.push({
        type: 'topping',
        name: t.name,
        label: t.name,
        value: t.id,
        price_delta: t.price,
        is_default: Boolean(t.defaultSelected),
        display_order: idx,
      });
    });

    const { error: presetError } = await supabase
      .from('customization_presets')
      .upsert(presets, { onConflict: 'type,value' as any });

    if (presetError) {
      console.warn(`Note on customization presets: ${presetError.message}. Inserting batch...`);
      await supabase.from('customization_presets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { error: insertErr } = await supabase.from('customization_presets').insert(presets);
      if (insertErr) throw insertErr;
    }
    console.log(`✅ ${presets.length} customization presets seeded!`);

    // --- Seed Stores ---
    console.log(`📦 Seeding stores...`);
    const storeRecords = MENU_DATA.stores.map((st) => ({
      name: st.name,
      address: st.address,
      short_address: st.shortAddress,
      city: st.city,
      state: st.state,
      zip: st.zip,
      phone: st.phone,
      latitude: 44.9866,
      longitude: -93.3768,
      is_open: st.isOpen,
      opening_time: '10:00 AM',
      closing_time: st.closingTime,
      pickup_time_estimate: st.pickupTime,
      delivery_time_estimate: '30-45 mins',
      is_flagship: Boolean(st.isFlagship),
      accepts_orders: Boolean(st.acceptingOrders),
      delivery_radius_miles: 5.0,
    }));

    const { error: storeError } = await supabase.from('stores').insert(storeRecords);
    if (storeError) {
      console.log(`Stores note: ${storeError.message}`);
    } else {
      console.log(`✅ Stores seeded!`);
    }

    // --- Seed Promo Codes ---
    console.log(`📦 Seeding promo codes...`);
    const { error: promoError } = await supabase
      .from('promo_codes')
      .upsert(PROMO_CODES, { onConflict: 'code' });

    if (promoError) throw promoError;
    console.log(`✅ ${PROMO_CODES.length} promo codes seeded!`);

    // --- Seed Menu Items ---
    console.log(`📦 Seeding ${MENU_DATA.items.length} menu items...`);
    const itemRecords = MENU_DATA.items
      .map((item, idx) => {
        const categoryId = categoryMap.get(item.category);
        if (!categoryId) {
          console.warn(`Category ${item.category} not found for item ${item.name}`);
          return null;
        }

        return {
          slug: item.id,
          category_id: categoryId,
          name: item.name,
          price: item.price,
          description: item.description,
          image_url: item.image,
          is_popular: Boolean(item.popular),
          badge: item.badge || null,
          caffeine: item.caffeine || null,
          calories: item.calories || null,
          is_available: Boolean(item.available),
          is_customizable: Boolean(item.customizable),
          display_order: idx,
        };
      })
      .filter(Boolean);

    const { error: itemError } = await supabase
      .from('menu_items')
      .upsert(itemRecords as any[], { onConflict: 'slug' });

    if (itemError) throw itemError;
    console.log(`✅ ${itemRecords.length} menu items seeded successfully!`);

    console.log('\n🎉 Live database seeding completed successfully!');
  } catch (err: any) {
    console.error('❌ Seeding error:', err.message || err);
    process.exit(1);
  }
}

runSeed();
