import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

/**
 * Hook for order related operations.
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createOrder = async (orderData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.createOrder(orderData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { createOrder, loading, error };
}

export function useGetOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getOrder(id);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { getOrder, loading, error };
}

export function useCancelOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelOrder = async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.cancelOrder(id, reason);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { cancelOrder, loading, error };
}
