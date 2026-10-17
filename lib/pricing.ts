import type { MetalRates, Product, ProductPricing } from '../types';

// A product shows a numeric price only in 'price' mode, with a real price, and not price-on-request.
export const isPricedProduct = (product: Pick<Product, 'cardDisplayMode' | 'priceOnRequest' | 'price'>): boolean => {
  const displayMode = product.cardDisplayMode || 'price';
  return displayMode === 'price' && product.priceOnRequest !== true && Number(product.price) > 0;
};

export const formatRupees = (amount: number): string => `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** What to show where a price goes: the price, the weight (if the card shows weight), or "Price on request". */
export const priceLabel = (
  product: Pick<Product, 'cardDisplayMode' | 'priceOnRequest' | 'price' | 'weight'>,
): string => {
  if (isPricedProduct(product)) return formatRupees(product.price);
  if (product.cardDisplayMode === 'weight' && product.weight?.trim()) return `Wt: ${product.weight}`;
  return 'Price on request';
};

export type RateUnit = '1g' | '10g' | '100g' | '1kg';

const UNIT_GRAMS: Record<RateUnit, number> = { '1g': 1, '10g': 10, '100g': 100, '1kg': 1000 };

/** Shows a per-gram rate in the unit customers expect, e.g. ₹70,000/10g for gold. */
export const formatRateByUnit = (perGram: number, unit: RateUnit): string => {
  if (!perGram || perGram <= 0) return '--';
  return `${formatRupees(perGram * UNIT_GRAMS[unit])}/${unit === '1kg' ? 'kg' : unit}`;
};

export const hasAnyRate = (rates: MetalRates): boolean =>
  rates.gold22k > 0 || rates.gold24k > 0 || rates.gold18k > 0 || rates.silver > 0;

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
