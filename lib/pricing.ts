import type { MetalRates, Product, ProductPricing } from '../types';

// A product shows a numeric price only in 'price' mode, with a real price, and not price-on-request.
export const isPricedProduct = (product: Pick<Product, 'cardDisplayMode' | 'priceOnRequest' | 'price'>): boolean => {
  const displayMode = product.cardDisplayMode || 'price';
  return displayMode === 'price' && product.priceOnRequest !== true && Number(product.price) > 0;
};

const RATE_KEYS = { GOLD_24K: 'gold24k', GOLD_22K: 'gold22k', GOLD_18K: 'gold18k', SILVER: 'silver' } as const;

/**
 * Admin-form preview of the server's price formula (apps/api/src/pricing/price-calculator.ts).
 * The server's value is the one customers see; this only gives instant feedback while typing.
 */
export const previewPrice = (pricing: ProductPricing, rates: MetalRates): number | null => {
  if (pricing.priceOnRequest || pricing.metalPurity === 'NONE') return null;
  const weight = pricing.netWeightGrams ?? 0;
  const rate = Number(rates[RATE_KEYS[pricing.metalPurity]]) || 0;
  if (!(weight > 0) || !(rate > 0)) return null;
  const metal = Math.round(rate * 100 * weight);
  const making =
    pricing.makingChargeType === 'PER_GRAM'
      ? Math.round(pricing.makingChargeValue * 100 * weight)
      : pricing.makingChargeType === 'PERCENT'
        ? Math.round((metal * pricing.makingChargeValue) / 100)
        : Math.round(pricing.makingChargeValue * 100);
  const subtotal = metal + making + Math.round(pricing.stoneValue * 100);
  return Math.round((subtotal + Math.round(subtotal * 0.03)) / 100);
};
