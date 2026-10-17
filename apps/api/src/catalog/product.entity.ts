import { MakingChargeType, MetalPurity } from '@prisma/client';

export { MakingChargeType, MetalPurity };

export interface Specification {
  key: string;
  value: string;
}

/** Inputs the price is computed from. Kept together because they only make sense as a set. */
export interface ProductPricing {
  metalPurity: MetalPurity;
  netWeightGrams: number | null;
  makingChargeType: MakingChargeType;
  makingChargeValue: number;
  stoneValue: number;
  /** Admin forces "Price on Request" even when a price could be computed. */
  priceOnRequest: boolean;
}

/** A product as the business sees it: plain values, independent of the database library. */
export interface Product {
  id: string;
  name: string;
  description: string;
  categories: string[];
  subcategory: string | null;
  images: string[];
  videos: string[];
  specifications: Specification[];
  /** Free-text weight an admin chose to show on cards, e.g. "12.5g". */
  weightLabel: string | null;
  cardDisplayMode: 'price' | 'weight' | 'none';
  inStock: boolean;
  isNew: boolean;
  isTrending: boolean;
  isFeaturedCollection: boolean;
  pricing: ProductPricing;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDraft = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
