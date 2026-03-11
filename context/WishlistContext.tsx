import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = 'sanghavi_wishlist_guest';
const LEGACY_WISHLIST_KEY = 'sanghavi_wishlist';

const readWishlistFromStorage = (key: string): Product[] => {
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const migrateLegacyGuestWishlist = () => {
  const alreadyMigrated = localStorage.getItem(GUEST_WISHLIST_KEY);
  if (alreadyMigrated) return;
  const legacy = localStorage.getItem(LEGACY_WISHLIST_KEY);
  if (!legacy) return;
  localStorage.setItem(GUEST_WISHLIST_KEY, legacy);
  localStorage.removeItem(LEGACY_WISHLIST_KEY);
};

const mergeWishlist = (base: Product[], incoming: Product[]): Product[] => {
  const map = new Map<string, Product>();
  base.forEach(item => map.set(item.id, item));
  incoming.forEach(item => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  // Load account-scoped wishlist. Migrate guest wishlist to user wishlist on first login.
  useEffect(() => {
    if (loading) return;

    migrateLegacyGuestWishlist();

    const nextKey = user?.uid ? `sanghavi_wishlist_${user.uid}` : GUEST_WISHLIST_KEY;
    const scopedWishlist = readWishlistFromStorage(nextKey);

    if (user?.uid) {
      const guestWishlist = readWishlistFromStorage(GUEST_WISHLIST_KEY);
      const merged = mergeWishlist(scopedWishlist, guestWishlist);
      if (guestWishlist.length > 0) {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
      setWishlist(merged);
      setStorageKey(nextKey);
      return;
    }

    setWishlist(scopedWishlist);
    setStorageKey(nextKey);
  }, [user?.uid, loading]);

  // Save wishlist to the active scope key.
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(wishlist));
  }, [wishlist, storageKey]);

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};