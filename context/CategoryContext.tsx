import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavItem } from '../types';
import { NAV_CONFIG as DEFAULT_NAV_CONFIG } from '../constants';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

interface CategoryContextType {
  categories: NavItem[];
  loading: boolean;
  saveCategories: (newCategories: NavItem[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time updates from Firestore
    const navRef = doc(db, 'settings', 'navigation');
    
    const unsubscribe = onSnapshot(navRef, (docSnap) => {
      if (docSnap.exists()) {
        setCategories(docSnap.data().items as NavItem[]);
      } else {
        // First time initialization: seed with defaults
        setDoc(navRef, { items: DEFAULT_NAV_CONFIG });
        setCategories(DEFAULT_NAV_CONFIG);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching navigation:", error);
      // Fallback to default if DB fails/offline
      setCategories(DEFAULT_NAV_CONFIG);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveCategories = async (newCategories: NavItem[]) => {
    const navRef = doc(db, 'settings', 'navigation');
    await setDoc(navRef, { items: newCategories });
  };

  const resetToDefault = async () => {
    const navRef = doc(db, 'settings', 'navigation');
    await setDoc(navRef, { items: DEFAULT_NAV_CONFIG });
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, saveCategories, resetToDefault }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};