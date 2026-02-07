import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { DEFAULT_SORT_OPTIONS } from '../constants';

interface SortOptionsContextType {
  sortOptions: string[];
  loading: boolean;
  saveSortOptions: (options: string[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const SortOptionsContext = createContext<SortOptionsContextType | undefined>(undefined);

export const SortOptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortOptions, setSortOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sortRef = doc(db, 'settings', 'sortOptions');
    const unsubscribe = onSnapshot(sortRef, (docSnap) => {
      if (docSnap.exists()) {
        const items = docSnap.data().items as string[] | undefined;
        setSortOptions(Array.isArray(items) && items.length > 0 ? items : DEFAULT_SORT_OPTIONS);
      } else {
        setDoc(sortRef, { items: DEFAULT_SORT_OPTIONS });
        setSortOptions(DEFAULT_SORT_OPTIONS);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching sort options:', error);
      setSortOptions(DEFAULT_SORT_OPTIONS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveSortOptions = async (options: string[]) => {
    const sortRef = doc(db, 'settings', 'sortOptions');
    await setDoc(sortRef, { items: options });
  };

  const resetToDefault = async () => {
    const sortRef = doc(db, 'settings', 'sortOptions');
    await setDoc(sortRef, { items: DEFAULT_SORT_OPTIONS });
  };

  return (
    <SortOptionsContext.Provider value={{ sortOptions, loading, saveSortOptions, resetToDefault }}>
      {children}
    </SortOptionsContext.Provider>
  );
};

export const useSortOptions = () => {
  const context = useContext(SortOptionsContext);
  if (context === undefined) {
    throw new Error('useSortOptions must be used within a SortOptionsProvider');
  }
  return context;
};
