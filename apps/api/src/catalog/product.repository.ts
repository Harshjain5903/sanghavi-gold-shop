import { Injectable } from '@nestjs/common';
import { Prisma, Product as ProductRow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductDraft, Specification } from './product.entity';

export abstract class ProductRepository {
  abstract findAll(limit: number): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract create(draft: ProductDraft): Promise<Product>;
  /** Returns null when no product has this id. */
  abstract update(id: string, draft: ProductDraft): Promise<Product | null>;
  /** Returns the deleted product, or null when no product has this id. */
  abstract delete(id: string): Promise<Product | null>;
}

const isNotFound = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

const DISPLAY_MODES = ['price', 'weight', 'none'] as const;

@Injectable()
export class PrismaProductRepository extends ProductRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(limit: number): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async create(draft: ProductDraft): Promise<Product> {
    return this.toDomain(await this.prisma.product.create({ data: this.toRow(draft) }));
  }

  // Single statement, so there is no gap between "check it exists" and "update it".
  async update(id: string, draft: ProductDraft): Promise<Product | null> {
    try {
      return this.toDomain(await this.prisma.product.update({ where: { id }, data: this.toRow(draft) }));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<Product | null> {
    try {
      return this.toDomain(await this.prisma.product.delete({ where: { id } }));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  private toRow(draft: ProductDraft): Prisma.ProductUncheckedCreateInput {
    return {
      name: draft.name,
      description: draft.description,
      categories: draft.categories,
      subcategory: draft.subcategory,
      images: draft.images,
      videos: draft.videos,
      specifications: draft.specifications as unknown as Prisma.InputJsonValue,
      weightLabel: draft.weightLabel,
      cardDisplayMode: draft.cardDisplayMode,
      inStock: draft.inStock,
      isNew: draft.isNew,
      isTrending: draft.isTrending,
      isFeaturedCollection: draft.isFeaturedCollection,
      metalPurity: draft.pricing.metalPurity,
      netWeightGrams: draft.pricing.netWeightGrams,
      makingChargeType: draft.pricing.makingChargeType,
      makingChargeValue: draft.pricing.makingChargeValue,
      stoneValue: draft.pricing.stoneValue,
      priceOnRequest: draft.pricing.priceOnRequest,
    };
  }

  private toDomain(row: ProductRow): Product {
    const specifications: Specification[] = Array.isArray(row.specifications)
      ? (row.specifications as unknown[]).flatMap((s) =>
          s && typeof s === 'object' && 'key' in s && 'value' in s
            ? [{ key: String((s as Specification).key), value: String((s as Specification).value) }]
            : [],
        )
      : [];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      categories: row.categories,
      subcategory: row.subcategory,
      images: row.images,
      videos: row.videos,
      specifications,
      weightLabel: row.weightLabel,
      cardDisplayMode: (DISPLAY_MODES as readonly string[]).includes(row.cardDisplayMode)
        ? (row.cardDisplayMode as Product['cardDisplayMode'])
        : 'price',
      inStock: row.inStock,
      isNew: row.isNew,
      isTrending: row.isTrending,
      isFeaturedCollection: row.isFeaturedCollection,
      pricing: {
        metalPurity: row.metalPurity,
        netWeightGrams: row.netWeightGrams === null ? null : Number(row.netWeightGrams),
        makingChargeType: row.makingChargeType,
        makingChargeValue: Number(row.makingChargeValue),
        stoneValue: Number(row.stoneValue),
        priceOnRequest: row.priceOnRequest,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
