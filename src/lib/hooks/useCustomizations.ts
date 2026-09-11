'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { MENU_DATA } from '@/data/menu-data';

/**
 * Fetches customization presets (sizes, sugar levels, ice levels, toppings)
 * from the live API. Falls back silently to static MENU_DATA on error.
 */
export function useCustomizations() {
  const [presets, setPresets] = useState(MENU_DATA.customizationPresets);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiClient
      .getCustomizations()
      .then((data) => {
        if (mounted && data?.sizes?.length) {
          setPresets(data);
        }
      })
      .catch(() => {
        // Silently fall back to static presets
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { presets, loading };
}
