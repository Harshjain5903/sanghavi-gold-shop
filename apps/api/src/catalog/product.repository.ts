import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type { Product };
export type ProductData = Omit<Prisma.ProductUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt'>;

export abstract class ProductRepository {
  abstract findAll(limit: number): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract create(data: ProductData): Promise<Product>;
  abstract update(id: string, data: ProductData): Promise<Product>;
  abstract delete(id: string): Promise<void>;
}

@Injectable()
export class PrismaProductRepository extends ProductRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findAll(limit: number): Promise<Product[]> {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }

  findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  create(data: ProductData): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  update(id: string, data: ProductData): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
