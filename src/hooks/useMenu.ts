'use client';

import { useState, useEffect, useCallback } from 'react';
import { MENU_DATA, MenuItem, Category } from '@/data/menu-data';
import { apiClient } from '@/lib/api-client';

interface UseMenuOptions {
  category?: string;
  query?: string;
  popularOnly?: boolean;
}

export function useMenu(options: UseMenuOptions = {}) {
  const { category = 'all', query = '', popularOnly = false } = options;

  const [categories, setCategories] = useState<Category[]>(MENU_DATA.categories);
  const [items, setItems] = useState<MenuItem[]>(MENU_DATA.items);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parallel fetch categories and items
      const [catRes, itemsRes] = await Promise.allSettled([
        apiClient.getCategories(),
        apiClient.getMenuItems({
          category: category !== 'all' ? category : undefined,
          popular: popularOnly ? true : undefined,
          q: query.trim() || undefined,
        }),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.categories?.length > 0) {
        setCategories(catRes.value.categories);
      }

      if (itemsRes.status === 'fulfilled' && itemsRes.value?.items) {
        setItems(itemsRes.value.items);
      } else {
        // Fallback filter on static data if network fails
        let filtered = MENU_DATA.items;
        if (category && category !== 'all') {
          filtered = filtered.filter((i) => i.category === category);
        }
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          filtered = filtered.filter(
            (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
          );
        }
        if (popularOnly) {
          filtered = filtered.filter((i) => i.popular);
        }
        setItems(filtered);
      }
    } catch (err: any) {
      console.warn('[useMenu] API error, using static fallback:', err);
      setError(err?.message || 'Failed to load live menu');

      // Local fallback
      let filtered = MENU_DATA.items;
      if (category && category !== 'all') {
        filtered = filtered.filter((i) => i.category === category);
      }
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(
          (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        );
      }
      if (popularOnly) {
        filtered = filtered.filter((i) => i.popular);
      }
      setItems(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [category, query, popularOnly]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  return {
    categories,
    items,
    isLoading,
    error,
    refetch: fetchMenuData,
  };
}
