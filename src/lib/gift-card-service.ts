import { createAdminClient } from '@/lib/supabase/admin';
import { SendGiftCardInput } from '@/lib/validators/gift-card';
import { sendGiftCardEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

// ─── Types & In-Memory Store ─────────────────────────────────────────────────

export interface GiftCardRecord {
  id: string;
  code: string;
  sender_user_id: string | null;
  sender_name: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  occasion: string | null;
  message: string | null;
  amount: number;
  balance: number;
  delivery_type: string;
  is_redeemed: boolean;
  redeemed_by_user_id: string | null;
  created_at: string;
}

const inMemoryGiftCards = new Map<string, GiftCardRecord>();

function isDbEnabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder');
}

/**
 * Generates a 16-character unique alphanumeric gift card code:
 * Format: MTEA-XXXX-XXXX-XXXX
 */
export function generateGiftCardCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // non-ambiguous chars
  const pick = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MTEA-${pick(4)}-${pick(4)}-${pick(4)}`;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
}

// ─── Service Methods ─────────────────────────────────────────────────────────

export async function createAndSendGiftCard(
  input: SendGiftCardInput,
  senderUserId?: string | null
): Promise<GiftCardRecord> {
  const id = generateId();
  const code = generateGiftCardCode();
  const now = new Date().toISOString();

  const record: GiftCardRecord = {
    id,
    code,
    sender_user_id: senderUserId || null,
    sender_name: input.senderName,
    recipient_name: input.recipientName,
    recipient_email: input.recipientEmail,
    recipient_phone: input.recipientPhone || null,
    occasion: input.occasion || 'Thinking of You 🧋',
    message: input.message || null,
    amount: Number(input.amount.toFixed(2)),
    balance: Number(input.amount.toFixed(2)),
    delivery_type: input.deliveryType,
    is_redeemed: false,
    redeemed_by_user_id: null,
    created_at: now,
  };

  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db.from('gift_cards').insert(record);
    } catch (err) {
      console.warn('[GiftCard] DB insert failed, using in-memory store:', err);
    }
  }

  // Always keep in memory for fast lookup / offline resilience
  inMemoryGiftCards.set(code, record);
  inMemoryGiftCards.set(id, record);

  // Send email to recipient
  sendGiftCardEmail(record);

  // Trigger notifications
  if (senderUserId) {
    createNotification(
      senderUserId,
      'GIFT_CARD_SENT',
      'Gift Card Sent! 🎁',
      `Your $${record.amount.toFixed(2)} gift card for ${record.recipient_name} has been sent successfully.`,
      { giftCardId: record.id, code: record.code, amount: record.amount, recipientEmail: record.recipient_email }
    ).catch(() => {});
  }

  if (isDbEnabled() && record.recipient_email) {
    (async () => {
      try {
        const { data } = await createAdminClient()
          .from('profiles')
          .select('id')
          .eq('email', record.recipient_email.toLowerCase())
          .maybeSingle();

        if (data?.id) {
          await createNotification(
            data.id,
            'GIFT_CARD_RECEIVED',
            'You Received a Gift Card! 🎁',
            `${record.sender_name} sent you a $${record.amount.toFixed(2)} MI TEA gift card!`,
            { giftCardId: record.id, code: record.code, amount: record.amount, senderName: record.sender_name }
          );
        }
      } catch {
        // Ignore notification error
      }
    })();
  }

  return record;
}

export async function getGiftCard(codeOrId: string): Promise<GiftCardRecord | null> {
  const norm = normalizeCode(codeOrId);

  // In-memory hit
  if (inMemoryGiftCards.has(norm)) {
    return inMemoryGiftCards.get(norm)!;
  }
  if (inMemoryGiftCards.has(codeOrId)) {
    return inMemoryGiftCards.get(codeOrId)!;
  }

  if (!isDbEnabled()) return null;

  try {
    const db = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codeOrId);

    if (isUuid) {
      const { data } = await db
        .from('gift_cards')
        .select('*')
        .eq('id', codeOrId)
        .maybeSingle();
      if (data) return data as GiftCardRecord;
    }

    const { data } = await db
      .from('gift_cards')
      .select('*')
      .eq('code', norm)
      .maybeSingle();

    return (data as GiftCardRecord) ?? null;
  } catch {
    return null;
  }
}

export async function getGiftCardBalance(code: string) {
  const card = await getGiftCard(code);
  if (!card) return null;

  return {
    code: card.code,
    amount: Number(card.amount),
    balance: Number(card.balance),
    isRedeemed: Boolean(card.is_redeemed) || card.balance <= 0,
    occasion: card.occasion,
    senderName: card.sender_name,
    recipientName: card.recipient_name,
    createdAt: card.created_at,
  };
}

export async function redeemGiftCard(
  code: string,
  redeemAmount: number,
  userId?: string | null
) {
  const card = await getGiftCard(code);
  if (!card) {
    throw new Error(`Gift card code '${code}' not found`);
  }

  if (card.is_redeemed || card.balance <= 0) {
    throw new Error('This gift card has already been fully redeemed');
  }

  if (redeemAmount <= 0) {
    throw new Error('Redemption amount must be greater than 0');
  }

  if (redeemAmount > card.balance) {
    throw new Error(
      `Cannot redeem $${redeemAmount.toFixed(2)}. Available balance is $${card.balance.toFixed(2)}.`
    );
  }

  const newBalance = Number(Math.max(0, card.balance - redeemAmount).toFixed(2));
  const isRedeemed = newBalance <= 0;

  // Update in DB
  if (isDbEnabled()) {
    try {
      const db = createAdminClient();
      await db
        .from('gift_cards')
        .update({
          balance: newBalance,
          is_redeemed: isRedeemed,
          redeemed_by_user_id: userId || card.redeemed_by_user_id,
        })
        .eq('id', card.id);
    } catch (err) {
      console.warn('[GiftCard] DB update failed:', err);
    }
  }

  // Update in-memory record
  card.balance = newBalance;
  card.is_redeemed = isRedeemed;
  if (userId) card.redeemed_by_user_id = userId;

  inMemoryGiftCards.set(card.code, card);
  inMemoryGiftCards.set(card.id, card);

  // Trigger notifications
  if (userId) {
    createNotification(
      userId,
      'GIFT_CARD_REDEEMED',
      'Gift Card Redeemed 🧋',
      `You redeemed $${redeemAmount.toFixed(2)} from gift card ${card.code}. Remaining balance: $${newBalance.toFixed(2)}.`,
      { giftCardId: card.id, code: card.code, redeemedAmount: redeemAmount, remainingBalance: newBalance }
    ).catch(() => {});
  }

  if (card.sender_user_id && card.sender_user_id !== userId) {
    createNotification(
      card.sender_user_id,
      'GIFT_CARD_USED',
      'Gift Card Used 🧋',
      `${card.recipient_name} redeemed $${redeemAmount.toFixed(2)} of their gift card.`,
      { giftCardId: card.id, code: card.code, redeemedAmount: redeemAmount, remainingBalance: newBalance }
    ).catch(() => {});
  }

  return {
    success: true,
    code: card.code,
    redeemedAmount: redeemAmount,
    remainingBalance: newBalance,
    isRedeemed,
  };
}

export async function getUserSentGiftCards(userId: string): Promise<GiftCardRecord[]> {
  if (!isDbEnabled()) {
    return Array.from(inMemoryGiftCards.values())
      .filter((c) => c.sender_user_id === userId && !c.id.includes('-dup'))
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
  }

  try {
    const db = createAdminClient();
    const { data } = await db
      .from('gift_cards')
      .select('*')
      .eq('sender_user_id', userId)
      .order('created_at', { ascending: false });

    return (data as GiftCardRecord[]) ?? [];
  } catch {
    return [];
  }
}
