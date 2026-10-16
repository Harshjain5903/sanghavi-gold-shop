import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_METAL_RATES } from '../constants';
import { MetalRates } from '../types';
import { apiFetch } from '../lib/api';

interface RatesContextType {
  rates: MetalRates;
  loading: boolean;
  saveRates: (rates: MetalRates) => Promise<void>;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

export const RatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<MetalRates>(DEFAULT_METAL_RATES as MetalRates);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setRates(await apiFetch<MetalRates>('/rates'));
    } catch (error) {
      console.error('Error fetching metal rates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Changing rates changes every rate-based product price, so callers should refresh products too.
  const saveRates = async (nextRates: MetalRates) => {
    const saved = await apiFetch<MetalRates>('/rates', {
      method: 'PUT',
      body: JSON.stringify({
        gold24k: nextRates.gold24k,
        gold22k: nextRates.gold22k,
        gold18k: nextRates.gold18k,
        silver: nextRates.silver,
        goldDisplayUnit: nextRates.goldDisplayUnit || '10g',
        silverDisplayUnit: nextRates.silverDisplayUnit || '1kg',
      }),
    });
    setRates(saved);
  };

  return <RatesContext.Provider value={{ rates, loading, saveRates }}>{children}</RatesContext.Provider>;
};

export const useRates = () => {
  const context = useContext(RatesContext);
  if (context === undefined) {
    throw new Error('useRates must be used within a RatesProvider');
  }
  return context;
};
