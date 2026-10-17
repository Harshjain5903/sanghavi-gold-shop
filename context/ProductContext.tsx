import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Product, ProductPricing } from '../types';
import { apiFetch } from '../lib/api';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string;
  addProduct: (product: Product) => Promise<void>;
  /** Pass refresh=false when saving many products in a row, then call refresh() once. */
  updateProduct: (updatedProduct: Product, options?: { refresh?: boolean }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  refresh: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const DEFAULT_PRICING: ProductPricing = {
  metalPurity: 'NONE',
  netWeightGrams: null,
  makingChargeType: 'PERCENT',
  makingChargeValue: 0,
  stoneValue: 0,
  priceOnRequest: true,
};

/** Only the fields an admin may edit; prices are computed by the server. */
const toProductInput = (product: Product) => {
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  return {
    name: product.name,
    description: product.description || '',
    category: product.category || [],
    subcategory: product.subcategory || '',
    images,
    videos: product.videos || [],
    specifications: (product.specifications || []).filter((s) => s.key.trim() || s.value.trim()),
    // Send back the admin's own label, not the displayed weight (which may be computed from net weight).
    weight: product.weightLabel !== undefined ? product.weightLabel ?? '' : product.weight || '',
    cardDisplayMode: product.cardDisplayMode || 'price',
    inStock: product.inStock !== false,
    isNew: !!product.isNew,
    isTrending: !!product.isTrending,
    isFeaturedCollection: !!product.isFeaturedCollection,
    pricing: product.pricing || DEFAULT_PRICING,
  };
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setProducts(await apiFetch<Product[]>('/products'));
      setError('');
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Products could not be loaded. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduct = async (product: Product) => {
    await apiFetch('/products', { method: 'POST', body: JSON.stringify(toProductInput(product)) });
    await refresh();
  };

  const updateProduct = async (updatedProduct: Product, options: { refresh?: boolean } = {}) => {
    await apiFetch(`/products/${encodeURIComponent(updatedProduct.id)}`, {
      method: 'PUT',
      body: JSON.stringify(toProductInput(updatedProduct)),
    });
    if (options.refresh !== false) await refresh();
  };

  const deleteProduct = async (id: string) => {
    await apiFetch(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refresh();
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  return (
    <ProductContext.Provider
      value={{ products, loading, error, addProduct, updateProduct, deleteProduct, getProductById, refresh }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
