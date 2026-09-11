import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

/** Hook to validate a delivery address against an optional store */
export function useAddressValidation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    valid: boolean;
    deliveryAddress?: any;
    reason?: string;
  } | null>(null);

  const validateAddress = async (data: {
    address: string;
    city: string;
    state: string;
    zip: string;
    storeId?: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.validateAddress(data);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to validate address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { validateAddress, result, loading, error };
}
