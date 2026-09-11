'use client';

import { useState, useEffect, useCallback } from 'react';
import { MENU_DATA, StoreLocation } from '@/data/menu-data';
import { apiClient } from '@/lib/api-client';

export function useStores() {
  const [stores, setStores] = useState<StoreLocation[]>(MENU_DATA.stores);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.getStores();
      if (res.stores && res.stores.length > 0) {
        setStores(res.stores);
      }
    } catch (err: any) {
      console.warn('[useStores] API error, using static fallback:', err);
      setError(err?.message || 'Failed to load live stores');
      setStores(MENU_DATA.stores);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    isLoading,
    error,
    refetch: fetchStores,
  };
}
