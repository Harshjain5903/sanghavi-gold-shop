import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { DEFAULT_FILTER_SECTIONS } from '../constants';
import { MegaMenuSection } from '../types';

interface FilterOptionsContextType {
  filterSections: MegaMenuSection[];
  loading: boolean;
  saveFilterSections: (sections: MegaMenuSection[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const FilterOptionsContext = createContext<FilterOptionsContextType | undefined>(undefined);

export const FilterOptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filterSections, setFilterSections] = useState<MegaMenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filterRef = doc(db, 'settings', 'filterOptions');
    const unsubscribe = onSnapshot(filterRef, (docSnap) => {
      if (docSnap.exists()) {
        const items = docSnap.data().items as MegaMenuSection[] | undefined;
        setFilterSections(Array.isArray(items) && items.length > 0 ? items : DEFAULT_FILTER_SECTIONS);
      } else {
        setDoc(filterRef, { items: DEFAULT_FILTER_SECTIONS });
        setFilterSections(DEFAULT_FILTER_SECTIONS);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching filter options:', error);
      setFilterSections(DEFAULT_FILTER_SECTIONS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveFilterSections = async (sections: MegaMenuSection[]) => {
    const filterRef = doc(db, 'settings', 'filterOptions');
    await setDoc(filterRef, { items: sections });
  };

  const resetToDefault = async () => {
    const filterRef = doc(db, 'settings', 'filterOptions');
    await setDoc(filterRef, { items: DEFAULT_FILTER_SECTIONS });
  };

  return (
    <FilterOptionsContext.Provider value={{ filterSections, loading, saveFilterSections, resetToDefault }}>
      {children}
    </FilterOptionsContext.Provider>
  );
};

export const useFilterOptions = () => {
  const context = useContext(FilterOptionsContext);
  if (context === undefined) {
    throw new Error('useFilterOptions must be used within a FilterOptionsProvider');
  }
  return context;
};
