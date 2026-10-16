import { Injectable, NotFoundException } from '@nestjs/common';
import { MetalPurity } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { PriceBreakdown, PriceCalculator, RatesPerGram } from '../pricing/price-calculator';
import { RatesService } from '../rates/rates.service';
import { ProductInputDto } from './dto/product-input.dto';
import { Product, ProductData, ProductRepository } from './product.repository';

const PURITY_LABELS: Record<MetalPurity, string> = {
  GOLD_24K: '24K Gold',
  GOLD_22K: '22K Gold',
  GOLD_18K: '18K Gold',
  SILVER: 'Silver',
  NONE: '',
};

/** Product as the website sees it: same fields as before, plus the computed price. */
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
  weight: string;
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
  /** The admin-editable pricing inputs. */
  pricing: {
    metalPurity: MetalPurity;
    netWeightGrams: number | null;
    makingChargeType: string;
    makingChargeValue: number;
    stoneValue: number;
    priceOnRequest: boolean;
  };
}

@Injectable()
export class CatalogService {
  private readonly calculator = new PriceCalculator();

  constructor(
    private readonly products: ProductRepository,
    private readonly rates: RatesService,
    private readonly audit: AuditService,
  ) {}

  async list(limit = 500): Promise<ProductView[]> {
    const [products, rates] = await Promise.all([this.products.findAll(limit), this.rates.currentPerGram()]);
    return products.map((product) => this.toView(product, rates));
  }

  async get(id: string): Promise<ProductView> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.toView(product, await this.rates.currentPerGram());
  }

  async create(actor: AuthUser, input: ProductInputDto): Promise<ProductView> {
    const product = await this.products.create(this.toData(input));
    await this.audit.record(actor, {
      action: 'PRODUCT_CREATED',
      targetType: 'product',
      targetId: product.id,
      metadata: { name: product.name },
    });
    return this.toView(product, await this.rates.currentPerGram());
  }

  async update(actor: AuthUser, id: string, input: ProductInputDto): Promise<ProductView> {
    if (!(await this.products.findById(id))) throw new NotFoundException('Product not found');
    const product = await this.products.update(id, this.toData(input));
    await this.audit.record(actor, {
      action: 'PRODUCT_UPDATED',
      targetType: 'product',
      targetId: id,
      metadata: { name: product.name },
    });
    return this.toView(product, await this.rates.currentPerGram());
  }

  async remove(actor: AuthUser, id: string): Promise<void> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.products.delete(id);
    await this.audit.record(actor, {
      action: 'PRODUCT_DELETED',
      targetType: 'product',
      targetId: id,
      metadata: { name: product.name },
    });
  }

  private toData(input: ProductInputDto): ProductData {
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
      metalPurity: input.pricing.metalPurity,
      netWeightGrams: input.pricing.netWeightGrams ?? null,
      makingChargeType: input.pricing.makingChargeType,
      makingChargeValue: input.pricing.makingChargeValue,
      stoneValue: input.pricing.stoneValue,
      priceOnRequest: input.pricing.priceOnRequest,
    };
  }

  private toView(product: Product, rates: RatesPerGram): ProductView {
    const pricing = {
      metalPurity: product.metalPurity,
      netWeightGrams: product.netWeightGrams === null ? null : Number(product.netWeightGrams),
      makingChargeType: product.makingChargeType,
      makingChargeValue: Number(product.makingChargeValue),
      stoneValue: Number(product.stoneValue),
      priceOnRequest: product.priceOnRequest,
    };
    const breakdown = this.calculator.calculate(pricing, rates);
    const weight =
      product.weightLabel || (pricing.netWeightGrams ? `${pricing.netWeightGrams}g` : '');

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.categories,
      subcategory: product.subcategory ?? '',
      image: product.images[0] ?? '',
      images: product.images,
      videos: product.videos,
      specifications: Array.isArray(product.specifications)
        ? (product.specifications as { key: string; value: string }[])
        : [],
      weight,
      purity: PURITY_LABELS[product.metalPurity],
      cardDisplayMode: product.cardDisplayMode,
      inStock: product.inStock,
      isNew: product.isNew,
      isTrending: product.isTrending,
      isFeaturedCollection: product.isFeaturedCollection,
      price: breakdown?.total ?? 0,
      priceOnRequest: breakdown === null,
      priceBreakdown: breakdown,
      pricing,
    };
  }
}
