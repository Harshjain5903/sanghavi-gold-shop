import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { TtlCache } from '../common/ttl-cache';
import { PriceCalculator, RatesPerGram } from '../pricing/price-calculator';
import { RatesService } from '../rates/rates.service';
import { ProductInputDto } from './dto/product-input.dto';
import { Product } from './product.entity';
import { ProductMapper, ProductView } from './product.mapper';
import { ProductRepository } from './product.repository';

const MAX_PRODUCTS = 1000;

@Injectable()
export class CatalogService {
  private readonly calculator = new PriceCalculator();
  // Every storefront page asks for the catalog; serve repeat requests from memory for a short while.
  private readonly listCache = new TtlCache<ProductView[]>(30_000);

  constructor(
    private readonly products: ProductRepository,
    private readonly rates: RatesService,
    private readonly audit: AuditService,
  ) {
    // New rates mean new prices.
    this.rates.onChange(() => this.listCache.invalidate());
  }

  async list(limit = MAX_PRODUCTS): Promise<ProductView[]> {
    const all = await this.listCache.get(async () => {
      const [products, rates] = await Promise.all([this.products.findAll(MAX_PRODUCTS), this.rates.currentPerGram()]);
      return products.map((product) => this.toView(product, rates));
    });
    return all.slice(0, limit);
  }

  async get(id: string): Promise<ProductView> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.toView(product, await this.rates.currentPerGram());
  }

  async create(actor: AuthUser, input: ProductInputDto): Promise<ProductView> {
    const product = await this.products.create(ProductMapper.toDraft(input));
    await this.afterChange(actor, 'PRODUCT_CREATED', product);
    return this.toView(product, await this.rates.currentPerGram());
  }

  async update(actor: AuthUser, id: string, input: ProductInputDto): Promise<ProductView> {
    const product = await this.products.update(id, ProductMapper.toDraft(input));
    if (!product) throw new NotFoundException('Product not found');
    await this.afterChange(actor, 'PRODUCT_UPDATED', product);
    return this.toView(product, await this.rates.currentPerGram());
  }

  async remove(actor: AuthUser, id: string): Promise<void> {
    const product = await this.products.delete(id);
    if (!product) throw new NotFoundException('Product not found');
    await this.afterChange(actor, 'PRODUCT_DELETED', product);
  }

  private async afterChange(actor: AuthUser, action: string, product: Product): Promise<void> {
    this.listCache.invalidate();
    await this.audit.record(actor, {
      action,
      targetType: 'product',
      targetId: product.id,
      metadata: { name: product.name },
    });
  }

  private toView(product: Product, rates: RatesPerGram): ProductView {
    return ProductMapper.toView(product, this.calculator.calculate(product.pricing, rates));
  }
}
