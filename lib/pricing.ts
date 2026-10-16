import type { Product } from '../types';

// A product shows a numeric price only in 'price' mode, with a real price, and not price-on-request.
export const isPricedProduct = (product: Pick<Product, 'cardDisplayMode' | 'priceOnRequest' | 'price'>): boolean => {
  const displayMode = product.cardDisplayMode || 'price';
  return displayMode === 'price' && product.priceOnRequest !== true && Number(product.price) > 0;
};
