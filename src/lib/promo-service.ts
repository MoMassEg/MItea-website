import { createServerClient } from '@/lib/supabase/server';
import { PromoValidationResult } from '@/lib/validators/promo';

const dynamicPromos = new Map<string, any>();

export function registerDynamicPromo(promo: any) {
  if (promo?.code) {
    dynamicPromos.set(promo.code.trim().toUpperCase(), promo);
  }
}

const FALLBACK_PROMOS = [
  {
    id: 'fallback-guild10',
    code: 'GUILD10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off your entire order (Guild Member welcome code)',
    min_order_amount: 0.0,
    max_uses: null as number | null,
    current_uses: 0,
    is_active: true,
    expires_at: null as string | null,
  },
  {
    id: 'fallback-firstorder',
    code: 'FIRSTORDER',
    discount_percent: 15,
    free_delivery: true,
    description: '15% off and free delivery on your first order over $15',
    min_order_amount: 15.0,
    max_uses: null as number | null,
    current_uses: 0,
    is_active: true,
    expires_at: null as string | null,
  },
  {
    id: 'fallback-boba10',
    code: 'BOBA10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off artisanal boba drinks',
    min_order_amount: 0.0,
    max_uses: null as number | null,
    current_uses: 0,
    is_active: true,
    expires_at: null as string | null,
  },
  {
    id: 'fallback-mitea10',
    code: 'MITEA10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off your favorite MiTea treats',
    min_order_amount: 0.0,
    max_uses: null as number | null,
    current_uses: 0,
    is_active: true,
    expires_at: null as string | null,
  },
  {
    id: 'fallback-welcome10',
    code: 'WELCOME10',
    discount_percent: 10,
    free_delivery: false,
    description: '10% off welcome discount for new customers',
    min_order_amount: 0.0,
    max_uses: null as number | null,
    current_uses: 0,
    is_active: true,
    expires_at: null as string | null,
  },
];

export async function checkPromoCode(
  code: string,
  subtotal: number = 0
): Promise<PromoValidationResult> {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { valid: false, reason: 'Promo code cannot be empty' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  let promo: any = null;

  if (!isPlaceholder) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        promo = data;
      }
    } catch {
      // Fall through to fallback promos
    }
  }

  if (!promo) {
    promo = dynamicPromos.get(cleanCode) || FALLBACK_PROMOS.find((p) => p.code === cleanCode);
  }

  if (!promo) {
    return {
      valid: false,
      code: cleanCode,
      reason: 'Code not found. Please verify and try again.',
    };
  }

  // Check if active
  if (!promo.is_active) {
    return {
      valid: false,
      code: cleanCode,
      reason: 'This promo code is no longer active.',
    };
  }

  // Check expiration date
  if (promo.expires_at) {
    const expiryTime = new Date(promo.expires_at).getTime();
    if (Date.now() > expiryTime) {
      return {
        valid: false,
        code: cleanCode,
        reason: 'This promo code has expired.',
      };
    }
  }

  // Check max uses
  if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
    return {
      valid: false,
      code: cleanCode,
      reason: 'This promo code has reached its maximum usage limit.',
    };
  }

  // Check minimum order amount
  const minOrder = Number(promo.min_order_amount) || 0;
  if (subtotal > 0 && subtotal < minOrder) {
    return {
      valid: false,
      code: cleanCode,
      reason: `Minimum order amount of $${minOrder.toFixed(2)} required to use this code.`,
    };
  }

  const discountPercent = Number(promo.discount_percent);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));

  return {
    valid: true,
    code: cleanCode,
    discountPercent,
    freeDelivery: Boolean(promo.free_delivery),
    description: promo.description,
    discountAmount,
    promoCodeId: promo.id,
  };
}

// ─── Admin Helpers ────────────────────────────────────────────────────────────

export async function getAllPromoCodes() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fall through to in-memory
    }
  }

  const all = [...FALLBACK_PROMOS, ...Array.from(dynamicPromos.values())];
  return all;
}

export async function createPromoCode(data: {
  code: string;
  discount_percent: number;
  free_delivery?: boolean;
  description?: string;
  min_order_amount?: number;
  max_uses?: number | null;
}) {
  const cleanCode = data.code.trim().toUpperCase();
  const id = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newPromo = {
    id,
    code: cleanCode,
    discount_percent: data.discount_percent,
    free_delivery: Boolean(data.free_delivery),
    description: data.description || `${data.discount_percent}% off`,
    min_order_amount: Number(data.min_order_amount) || 0,
    max_uses: data.max_uses || null,
    current_uses: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const supabase = await createServerClient();
      const { data: inserted, error } = await supabase
        .from('promo_codes')
        .insert({
          code: cleanCode,
          discount_percent: data.discount_percent,
          free_delivery: Boolean(data.free_delivery),
          description: newPromo.description,
          min_order_amount: newPromo.min_order_amount,
          is_active: true,
        })
        .select()
        .single();

      if (!error && inserted) {
        return inserted;
      }
    } catch {
      // Fall through
    }
  }

  dynamicPromos.set(cleanCode, newPromo);
  return newPromo;
}

export async function togglePromoCodeActive(id: string, is_active: boolean) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const supabase = await createServerClient();
      await supabase.from('promo_codes').update({ is_active }).eq('id', id);
    } catch {
      // Fall through
    }
  }

  for (const promo of dynamicPromos.values()) {
    if (promo.id === id || promo.code === id) {
      promo.is_active = is_active;
      return promo;
    }
  }

  const fallback = FALLBACK_PROMOS.find((p) => p.id === id || p.code === id);
  if (fallback) {
    fallback.is_active = is_active;
    return fallback;
  }

  return null;
}

export async function deletePromoCode(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  if (!isPlaceholder) {
    try {
      const supabase = await createServerClient();
      await supabase.from('promo_codes').delete().eq('id', id);
      return true;
    } catch {
      // Fall through
    }
  }

  for (const [code, promo] of dynamicPromos.entries()) {
    if (promo.id === id || promo.code === id) {
      dynamicPromos.delete(code);
      return true;
    }
  }

  const idx = FALLBACK_PROMOS.findIndex((p) => p.id === id || p.code === id);
  if (idx !== -1) {
    FALLBACK_PROMOS.splice(idx, 1);
    return true;
  }

  return false;
}
