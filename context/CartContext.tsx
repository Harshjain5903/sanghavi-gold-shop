import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { isPricedProduct } from '../lib/pricing';
import { readJson, removeKey, writeJson } from '../lib/storage';

interface CartContextType {
  /** Bag lines joined with the live catalog, so prices are always today's prices. */
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

/** What is stored: only the product id and quantity. Prices are never stored in the browser. */
interface CartLine {
  id: string;
  quantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = 'sanghavi_cart_guest';
const LEGACY_CART_KEY = 'sanghavi_cart';
const MAX_QUANTITY = 20;

// Older versions stored whole product objects; keep only id + quantity from them.
const readLines = (key: string): CartLine[] => {
  const saved = readJson<unknown>(key, []);
  if (!Array.isArray(saved)) return [];
  return saved.flatMap((entry) => {
    const id = entry && typeof entry === 'object' ? String((entry as CartLine).id ?? '') : '';
    const quantity = Math.min(Math.max(Number((entry as CartLine)?.quantity) || 1, 1), MAX_QUANTITY);
    return id ? [{ id, quantity }] : [];
  });
};

const mergeLines = (base: CartLine[], incoming: CartLine[]): CartLine[] => {
  const map = new Map(base.map((line) => [line.id, { ...line }]));
  incoming.forEach((line) => {
    const existing = map.get(line.id);
    map.set(line.id, {
      id: line.id,
      quantity: Math.min((existing?.quantity ?? 0) + line.quantity, MAX_QUANTITY),
    });
  });
  return [...map.values()];
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  // Load the account's bag; on sign-in, merge in anything added as a guest.
  useEffect(() => {
    if (authLoading) return;
    const legacy = readLines(LEGACY_CART_KEY);
    if (legacy.length) {
      writeJson(GUEST_CART_KEY, mergeLines(readLines(GUEST_CART_KEY), legacy));
      removeKey(LEGACY_CART_KEY);
    }

    const key = user?.uid ? `sanghavi_cart_${user.uid}` : GUEST_CART_KEY;
    let next = readLines(key);
    if (user?.uid) {
      const guest = readLines(GUEST_CART_KEY);
      if (guest.length) {
        next = mergeLines(next, guest);
        removeKey(GUEST_CART_KEY);
      }
    }
    setLines(next);
    setStorageKey(key);
  }, [user?.uid, authLoading]);

  useEffect(() => {
    if (storageKey) writeJson(storageKey, lines);
  }, [lines, storageKey]);

  // Drop lines for products that were deleted from the shop (only once the catalog has loaded).
  useEffect(() => {
    if (productsLoading || products.length === 0) return;
    const known = new Set(products.map((p) => p.id));
    setLines((prev) => (prev.every((line) => known.has(line.id)) ? prev : prev.filter((line) => known.has(line.id))));
  }, [products, productsLoading]);

  const items = useMemo<CartItem[]>(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return lines.flatMap((line) => {
      const product = byId.get(line.id);
      return product ? [{ ...product, quantity: line.quantity }] : [];
    });
  }, [lines, products]);

  const addToCart = (product: Product) => {
    setLines((prev) => mergeLines(prev, [{ id: product.id, quantity: 1 }]));
  };

  const removeFromCart = (productId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1 || quantity > MAX_QUANTITY) return;
    setLines((prev) => prev.map((line) => (line.id === productId ? { ...line, quantity } : line)));
  };

  const clearCart = () => setLines([]);

  const cartTotal = items.reduce((total, item) => (isPricedProduct(item) ? total + item.price * item.quantity : total), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
