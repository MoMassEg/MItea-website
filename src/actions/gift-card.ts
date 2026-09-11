'use server';

import {
  sendGiftCardSchema,
  SendGiftCardInput,
  redeemGiftCardSchema,
} from '@/lib/validators/gift-card';
import {
  createAndSendGiftCard,
  getGiftCardBalance,
  redeemGiftCard,
  getUserSentGiftCards,
} from '@/lib/gift-card-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function sendGiftCard(input: SendGiftCardInput) {
  try {
    const validated = sendGiftCardSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid gift card parameters',
      };
    }

    const user = await getCurrentUser();
    const giftCard = await createAndSendGiftCard(validated.data, user?.id);

    return {
      success: true,
      giftCard,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to send gift card',
    };
  }
}

export async function getGiftCardBalanceAction(code: string) {
  try {
    const balanceInfo = await getGiftCardBalance(code);
    if (!balanceInfo) {
      return {
        success: false,
        error: `Gift card code '${code}' not found`,
      };
    }
    return {
      success: true,
      giftCard: balanceInfo,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to retrieve balance',
    };
  }
}

export async function redeemGiftCardAction(code: string, amount: number) {
  try {
    const validated = redeemGiftCardSchema.safeParse({ amount });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid redemption amount',
      };
    }

    const user = await getCurrentUser();
    const result = await redeemGiftCard(code, validated.data.amount, user?.id);

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to redeem gift card',
    };
  }
}

export async function getUserSentGiftCardsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const giftCards = await getUserSentGiftCards(user.id);
    return {
      success: true,
      giftCards,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch sent gift cards',
    };
  }
}
