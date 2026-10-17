import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { readJson, removeKey, writeJson } from '../lib/storage';

interface WishlistContextType {
  /** Wishlisted products with live data (price, stock) from the catalog. */
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = 'sanghavi_wishlist_guest';
const LEGACY_WISHLIST_KEY = 'sanghavi_wishlist';

// Stores only product ids. Older versions stored whole products; keep just their ids.
const readIds = (key: string): string[] => {
  const saved = readJson<unknown>(key, []);
  if (!Array.isArray(saved)) return [];
  return saved
    .map((entry) => (typeof entry === 'string' ? entry : entry && typeof entry === 'object' ? String((entry as Product).id ?? '') : ''))
    .filter(Boolean);
};

const unique = (ids: string[]) => [...new Set(ids)];

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [ids, setIds] = useState<string[]>([]);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const legacy = readIds(LEGACY_WISHLIST_KEY);
    if (legacy.length) {
      writeJson(GUEST_WISHLIST_KEY, unique([...readIds(GUEST_WISHLIST_KEY), ...legacy]));
      removeKey(LEGACY_WISHLIST_KEY);
    }

    const key = user?.uid ? `sanghavi_wishlist_${user.uid}` : GUEST_WISHLIST_KEY;
    let next = readIds(key);
    if (user?.uid) {
      const guest = readIds(GUEST_WISHLIST_KEY);
      if (guest.length) {
        next = unique([...next, ...guest]);
        removeKey(GUEST_WISHLIST_KEY);
      }
    }
    setIds(next);
    setStorageKey(key);
  }, [user?.uid, authLoading]);

  useEffect(() => {
    if (storageKey) writeJson(storageKey, ids);
  }, [ids, storageKey]);

  useEffect(() => {
    if (productsLoading || products.length === 0) return;
    const known = new Set(products.map((p) => p.id));
    setIds((prev) => (prev.every((id) => known.has(id)) ? prev : prev.filter((id) => known.has(id))));
  }, [products, productsLoading]);

  const wishlist = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return ids.flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    });
  }, [ids, products]);

  const addToWishlist = (product: Product) => setIds((prev) => unique([...prev, product.id]));
  const removeFromWishlist = (productId: string) => setIds((prev) => prev.filter((id) => id !== productId));
  const isInWishlist = (productId: string) => ids.includes(productId);

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
