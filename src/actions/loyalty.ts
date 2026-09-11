'use server';

import { getCurrentUser } from '@/lib/auth-helpers';
import {
  getUserLoyaltyCard,
  redeemReward as redeemRewardService,
  getLoyaltyHistory as getLoyaltyHistoryService,
} from '@/lib/loyalty-service';

export async function redeemReward() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized: Authentication required to redeem loyalty rewards',
      };
    }

    const result = await redeemRewardService(user.id);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to redeem reward',
    };
  }
}

export async function getLoyaltyStampsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized: Authentication required',
      };
    }

    const card = await getUserLoyaltyCard(user.id);
    return {
      success: true,
      loyalty: card,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to retrieve loyalty card',
    };
  }
}

export async function getLoyaltyHistoryAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized: Authentication required',
      };
    }

    const history = await getLoyaltyHistoryService(user.id);
    return {
      success: true,
      history,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to retrieve loyalty history',
    };
  }
}
