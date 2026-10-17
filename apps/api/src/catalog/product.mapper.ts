import { PriceBreakdown } from '../pricing/price-calculator';
import { ProductInputDto } from './dto/product-input.dto';
import { MetalPurity, Product, ProductDraft, ProductPricing } from './product.entity';

const PURITY_LABELS: Record<MetalPurity, string> = {
  GOLD_24K: '24K Gold',
  GOLD_22K: '22K Gold',
  GOLD_18K: '18K Gold',
  SILVER: 'Silver',
  NONE: '',
};

/** Product as the website sees it: the fields the storefront already used, plus the computed price. */
export interface ProductView {
  id: string;
  name: string;
  description: string;
  category: string[];
  subcategory: string;
  image: string;
  images: string[];
  videos: string[];
  specifications: { key: string; value: string }[];
  /** Weight to display: the admin's label, or the net weight. */
  weight: string;
  /** What the admin typed as the card label (null = use net weight). Sent back unchanged on save. */
  weightLabel: string | null;
  purity: string;
  cardDisplayMode: string;
  inStock: boolean;
  isNew: boolean;
  isTrending: boolean;
  isFeaturedCollection: boolean;
  /** Computed price in ₹, or 0 when it can't be priced. */
  price: number;
  /** True when the website should show "Price on Request". */
  priceOnRequest: boolean;
  priceBreakdown: PriceBreakdown | null;
  pricing: ProductPricing;
}

/** Translates between the API's shapes (DTO in, view out) and the domain product. */
export class ProductMapper {
  static toDraft(input: ProductInputDto): ProductDraft {
    return {
      name: input.name.trim(),
      description: input.description ?? '',
      categories: input.category.map((c) => c.trim()).filter(Boolean),
      subcategory: input.subcategory?.trim() || null,
      images: input.images,
      videos: input.videos ?? [],
      specifications: (input.specifications ?? []).map(({ key, value }) => ({ key, value })),
      weightLabel: input.weight?.trim() || null,
      cardDisplayMode: input.cardDisplayMode ?? 'price',
      inStock: input.inStock ?? true,
      isNew: input.isNew ?? false,
      isTrending: input.isTrending ?? false,
      isFeaturedCollection: input.isFeaturedCollection ?? false,
      pricing: {
        metalPurity: input.pricing.metalPurity,
        netWeightGrams: input.pricing.netWeightGrams ?? null,
        makingChargeType: input.pricing.makingChargeType,
        makingChargeValue: input.pricing.makingChargeValue,
        stoneValue: input.pricing.stoneValue,
        priceOnRequest: input.pricing.priceOnRequest,
      },
    };
  }

  static toView(product: Product, breakdown: PriceBreakdown | null): ProductView {
    const netWeight = product.pricing.netWeightGrams;
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.categories,
      subcategory: product.subcategory ?? '',
      image: product.images[0] ?? '',
      images: product.images,
      videos: product.videos,
      specifications: product.specifications,
      weight: product.weightLabel || (netWeight ? `${netWeight}g` : ''),
      weightLabel: product.weightLabel,
      purity: PURITY_LABELS[product.pricing.metalPurity],
      cardDisplayMode: product.cardDisplayMode,
      inStock: product.inStock,
      isNew: product.isNew,
      isTrending: product.isTrending,
      isFeaturedCollection: product.isFeaturedCollection,
      price: breakdown?.total ?? 0,
      priceOnRequest: breakdown === null,
      priceBreakdown: breakdown,
      pricing: product.pricing,
    };
  }
}
