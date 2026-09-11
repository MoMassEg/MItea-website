import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

/** Hook for loyalty related operations */
export function useGetLoyaltyCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getLoyaltyCard = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getLoyaltyCard();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loyalty card');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { getLoyaltyCard, loading, error };
}

export function useAddLoyaltyStamp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addStamp = async (count: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.addLoyaltyStamp(count);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to add loyalty stamp');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { addStamp, loading, error };
}

export function useRedeemLoyaltyReward() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redeemReward = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.redeemLoyaltyReward();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to redeem loyalty reward');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { redeemReward, loading, error };
}
