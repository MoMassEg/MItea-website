-- Add per-item customer notes to order_items (special instructions from product modal)
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS notes TEXT;
