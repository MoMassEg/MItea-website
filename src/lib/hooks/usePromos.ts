import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

/** Hook to validate a promo code against the current subtotal */
export function useValidatePromo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromo = async (code: string, subtotal: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.validatePromo(code, subtotal);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to validate promo code');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { validatePromo, loading, error };
}
