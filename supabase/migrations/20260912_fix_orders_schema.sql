-- =============================================================================
-- MiTea — Fix Orders Schema Issues
-- Migration: 20260912_fix_orders_schema
-- =============================================================================

-- 1. Make customer_phone nullable (guest checkout may not include a phone)
ALTER TABLE public.orders
  ALTER COLUMN customer_phone DROP NOT NULL,
  ALTER COLUMN customer_phone SET DEFAULT '';

-- 2. Fix status CHECK constraint to also allow 'READY' and 'PAYMENT_FAILED'
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'COMPLETED',
      'CANCELLED',
      'PAYMENT_FAILED'
    )
  );

-- 3. Make order_items.menu_item_id nullable so non-UUID slugs don't break FK
--    (The name and details are stored directly on the row anyway)
ALTER TABLE public.order_items
  ALTER COLUMN menu_item_id DROP NOT NULL;

ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_menu_item_id_fkey
    FOREIGN KEY (menu_item_id)
    REFERENCES public.menu_items(id)
    ON DELETE SET NULL;

-- 4. Make order_items image_url, sugar_level, ice_level have safe defaults
ALTER TABLE public.order_items
  ALTER COLUMN image_url SET DEFAULT '',
  ALTER COLUMN sugar_level SET DEFAULT '',
  ALTER COLUMN ice_level SET DEFAULT '';

-- 5. Ensure store_id in orders is safely nullable and ON DELETE SET NULL
ALTER TABLE public.orders
  ALTER COLUMN store_id DROP NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_store_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_store_id_fkey
    FOREIGN KEY (store_id)
    REFERENCES public.stores(id)
    ON DELETE SET NULL;

-- 6. Ensure default flagship store exists for foreign key references
INSERT INTO public.stores (id, name, address, short_address, city, state, zip, phone, is_open, is_flagship, accepts_orders)
VALUES (
  '5ad5e69f-b811-40e8-983a-dde710039af2',
  'Mitea — Golden Valley',
  '7724 Olson Mem Hwy, Golden Valley, MN 55427, United States',
  '7724 Olson Mem Hwy',
  'Golden Valley',
  'MN',
  '55427',
  '(763) 555-0192',
  true,
  true,
  true
)
ON CONFLICT (id) DO UPDATE
SET is_flagship = true, accepts_orders = true;

-- 7. Allow service_role to bypass RLS on orders (already true by default,
--    but make explicit with a permissive policy for the service role)
DROP POLICY IF EXISTS "Service role can do anything on orders" ON public.orders;
CREATE POLICY "Service role can do anything on orders"
  ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can do anything on order_items" ON public.order_items;
CREATE POLICY "Service role can do anything on order_items"
  ON public.order_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
