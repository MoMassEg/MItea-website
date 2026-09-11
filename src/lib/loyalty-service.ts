import { createAdminClient } from '@/lib/supabase/admin';
import { registerDynamicPromo } from '@/lib/promo-service';

export interface LoyaltyCard {
  id: string;
  user_id: string;
  stamps: number;
  total_stamps_earned: number;
  total_rewards_redeemed: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  type: 'STAMP_EARNED' | 'REWARD_REDEEMED';
  order_id: string | null;
  description: string;
  created_at: string;
}

// ─── In-Memory Fallback Stores ────────────────────────────────────────────────

const inMemoryCards = new Map<string, LoyaltyCard>();
const inMemoryTransactions = new Map<string, LoyaltyTransaction[]>();

function isDbEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder');
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
}

function generateRewardPromoCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const pick = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FREE-${pick(4)}-${pick(4)}`;
}

// ─── Public Methods ──────────────────────────────────────────────────────────

export async function getUserLoyaltyCard(userId: string) {
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data, error } = await db
        .from('loyalty_cards')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          stampsRemaining: Math.max(0, 10 - data.stamps),
          rewardReady: data.stamps >= 10,
        };
      }

      // Initialize row if not found
      const newCard: LoyaltyCard = {
        id: generateId(),
        user_id: userId,
        stamps: 0,
        total_stamps_earned: 0,
        total_rewards_redeemed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.from('loyalty_cards').insert(newCard);

      inMemoryCards.set(userId, newCard);
      return {
        ...newCard,
        stampsRemaining: 10,
        rewardReady: false,
      };
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  let card = inMemoryCards.get(userId);
  if (!card) {
    card = {
      id: generateId(),
      user_id: userId,
      stamps: 0,
      total_stamps_earned: 0,
      total_rewards_redeemed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryCards.set(userId, card);
  }

  return {
    ...card,
    stampsRemaining: Math.max(0, 10 - card.stamps),
    rewardReady: card.stamps >= 10,
  };
}

export async function addStamp(
  userId: string,
  count: number = 1,
  orderId?: string | null
) {
  const cardData = await getUserLoyaltyCard(userId);
  const now = new Date().toISOString();

  const newStamps = cardData.stamps + count;
  const newTotalEarned = cardData.total_stamps_earned + count;

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db
        .from('loyalty_cards')
        .update({
          stamps: newStamps,
          total_stamps_earned: newTotalEarned,
          updated_at: now,
        })
        .eq('user_id', userId);

      await db.from('loyalty_transactions').insert({
        id: generateId(),
        user_id: userId,
        type: 'STAMP_EARNED',
        order_id: orderId || null,
        description: `Earned ${count} tea stamp(s) from order`,
        created_at: now,
      });
    } catch (err) {
      console.warn('[Loyalty] DB update failed, using in-memory:', err);
    }
  }

  // Update in-memory
  const updatedCard: LoyaltyCard = {
    id: cardData.id,
    user_id: userId,
    stamps: newStamps,
    total_stamps_earned: newTotalEarned,
    total_rewards_redeemed: cardData.total_rewards_redeemed,
    created_at: cardData.created_at,
    updated_at: now,
  };
  inMemoryCards.set(userId, updatedCard);

  const tx: LoyaltyTransaction = {
    id: generateId(),
    user_id: userId,
    type: 'STAMP_EARNED',
    order_id: orderId || null,
    description: `Earned ${count} tea stamp(s) from order`,
    created_at: now,
  };
  const list = inMemoryTransactions.get(userId) || [];
  list.unshift(tx);
  inMemoryTransactions.set(userId, list);

  import('@/lib/notifications')
    .then(({ createNotification }) => {
      createNotification(
        userId,
        'STAMP_EARNED',
        'Stamp Earned! 🧋',
        `🎉 Stamp earned! ${Math.max(0, 10 - newStamps)} more to go until your free drink.`,
        { currentStamps: newStamps }
      );
    })
    .catch(() => {});

  return {
    ...updatedCard,
    stampsRemaining: Math.max(0, 10 - newStamps),
    rewardReady: newStamps >= 10,
  };
}

export async function redeemReward(userId: string) {
  const cardData = await getUserLoyaltyCard(userId);

  if (cardData.stamps < 10) {
    throw new Error(
      `Insufficient stamps to redeem reward. You have ${cardData.stamps}/10 stamps.`
    );
  }

  const now = new Date().toISOString();
  const newStamps = cardData.stamps - 10;
  const newTotalRedeemed = cardData.total_rewards_redeemed + 1;

  // Generate single-use promo code
  const promoCode = generateRewardPromoCode();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const promoRecord = {
    id: generateId(),
    code: promoCode,
    discount_percent: 100,
    free_delivery: false,
    description: 'Loyalty Reward: 1 Free Handcrafted Artisanal Drink (100% off)',
    min_order_amount: 0,
    max_uses: 1,
    current_uses: 0,
    expires_at: expiresAt,
    is_active: true,
    created_at: now,
  };

  // Register in promo service
  registerDynamicPromo(promoRecord);

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db.from('promo_codes').insert(promoRecord);

      await db
        .from('loyalty_cards')
        .update({
          stamps: newStamps,
          total_rewards_redeemed: newTotalRedeemed,
          updated_at: now,
        })
        .eq('user_id', userId);

      await db.from('loyalty_transactions').insert({
        id: generateId(),
        user_id: userId,
        type: 'REWARD_REDEEMED',
        order_id: null,
        description: `Redeemed 10 stamps for Free Drink Voucher: ${promoCode}`,
        created_at: now,
      });
    } catch (err) {
      console.warn('[Loyalty] DB reward redemption failed, using in-memory:', err);
    }
  }

  // Update in-memory
  const updatedCard: LoyaltyCard = {
    id: cardData.id,
    user_id: userId,
    stamps: newStamps,
    total_stamps_earned: cardData.total_stamps_earned,
    total_rewards_redeemed: newTotalRedeemed,
    created_at: cardData.created_at,
    updated_at: now,
  };
  inMemoryCards.set(userId, updatedCard);

  const tx: LoyaltyTransaction = {
    id: generateId(),
    user_id: userId,
    type: 'REWARD_REDEEMED',
    order_id: null,
    description: `Redeemed 10 stamps for Free Drink Voucher: ${promoCode}`,
    created_at: now,
  };
  const list = inMemoryTransactions.get(userId) || [];
  list.unshift(tx);
  inMemoryTransactions.set(userId, list);

  import('@/lib/notifications')
    .then(({ createNotification }) => {
      createNotification(
        userId,
        'REWARD_REDEEMED',
        'Free Drink Unlocked! 🎁',
        `Use code ${promoCode} for a free handcrafted drink!`,
        { promoCode }
      );
    })
    .catch(() => {});

  return {
    success: true,
    promoCode,
    discountPercent: 100,
    expiresAt,
    remainingStamps: newStamps,
    totalRewardsRedeemed: newTotalRedeemed,
  };
}

export async function getLoyaltyHistory(userId: string): Promise<LoyaltyTransaction[]> {
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      const { data, error } = await db
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as LoyaltyTransaction[];
      }
    } catch {
      // Fallback
    }
  }

  return inMemoryTransactions.get(userId) || [];
}
