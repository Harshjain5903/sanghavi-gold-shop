import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { DEFAULT_METAL_RATES } from '../constants';
import { MetalRates } from '../types';

interface RatesContextType {
  rates: MetalRates;
  loading: boolean;
  saveRates: (rates: MetalRates) => Promise<void>;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

export const RatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<MetalRates>(DEFAULT_METAL_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ratesRef = doc(db, 'settings', 'rates');
    const unsubscribe = onSnapshot(
      ratesRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<MetalRates> | undefined;
          setRates({
            gold22k: Number(data?.gold22k || 0),
            gold24k: Number(data?.gold24k || 0),
            gold18k: Number(data?.gold18k || 0),
            silver: Number(data?.silver || 0),
            goldDisplayUnit: data?.goldDisplayUnit || '10g',
            silverDisplayUnit: data?.silverDisplayUnit || '1kg',
            updatedAt: data?.updatedAt || ''
          });
        } else {
          setDoc(ratesRef, DEFAULT_METAL_RATES);
          setRates(DEFAULT_METAL_RATES);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching metal rates:', error);
        setRates(DEFAULT_METAL_RATES);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveRates = async (nextRates: MetalRates) => {
    const ratesRef = doc(db, 'settings', 'rates');
    await setDoc(ratesRef, nextRates);
  };

  return (
    <RatesContext.Provider value={{ rates, loading, saveRates }}>
      {children}
    </RatesContext.Provider>
  );
};

export const useRates = () => {
  const context = useContext(RatesContext);
  if (context === undefined) {
    throw new Error('useRates must be used within a RatesProvider');
  }
  return context;
};
