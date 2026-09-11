import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

/** Hook to check a gift card balance */
export function useGiftCardBalance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBalance = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getGiftCardBalance(code);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gift card balance');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getBalance, loading, error };
}

/** Hook to redeem a gift card */
export function useRedeemGiftCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeemGiftCard = async (code: string, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.redeemGiftCard(code, amount);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to redeem gift card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { redeemGiftCard, loading, error };
}
