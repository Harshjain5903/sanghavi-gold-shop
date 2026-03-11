import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = 'sanghavi_cart_guest';
const LEGACY_CART_KEY = 'sanghavi_cart';

const readCartFromStorage = (key: string): CartItem[] => {
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const migrateLegacyGuestCart = () => {
  const alreadyMigrated = localStorage.getItem(GUEST_CART_KEY);
  if (alreadyMigrated) return;
  const legacy = localStorage.getItem(LEGACY_CART_KEY);
  if (!legacy) return;
  localStorage.setItem(GUEST_CART_KEY, legacy);
  localStorage.removeItem(LEGACY_CART_KEY);
};

const mergeCartItems = (base: CartItem[], incoming: CartItem[]): CartItem[] => {
  const map = new Map<string, CartItem>();
  base.forEach(item => map.set(item.id, { ...item }));
  incoming.forEach(item => {
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(item.id, { ...item });
    }
  });
  return Array.from(map.values());
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  // Load account-scoped cart. Migrate guest cart to user cart on first login.
  useEffect(() => {
    if (loading) return;

    migrateLegacyGuestCart();

    const nextKey = user?.uid ? `sanghavi_cart_${user.uid}` : GUEST_CART_KEY;
    const scopedCart = readCartFromStorage(nextKey);

    if (user?.uid) {
      const guestCart = readCartFromStorage(GUEST_CART_KEY);
      const merged = mergeCartItems(scopedCart, guestCart);
      if (guestCart.length > 0) {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      setItems(merged);
      setStorageKey(nextKey);
      return;
    }

    setItems(scopedCart);
    setStorageKey(nextKey);
  }, [user?.uid, loading]);

  // Save cart to the active scope key.
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const isPricedItem = (item: CartItem) => {
    const displayMode = item.cardDisplayMode || 'price';
    const isPriceOnRequest = item.priceOnRequest === true;
    const hasPrice = item.price && item.price > 0;
    return displayMode === 'price' && hasPrice && !isPriceOnRequest;
  };

  const cartTotal = items.reduce((total, item) => {
    if (!isPricedItem(item)) return total;
    return total + (item.price * item.quantity);
  }, 0);
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