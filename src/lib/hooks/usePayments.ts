import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

export function useCreatePaymentIntent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createIntent = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.createPaymentIntent(orderId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment intent');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { createIntent, loading, error };
}

/** Hook for payment related operations */
export function useCreateStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createCheckout = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.createStripeCheckout(orderId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create Stripe checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { createCheckout, loading, error };
}

export function usePayWithCash() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payCash = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.payWithCash(orderId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to process cash payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { payCash, loading, error };
}
