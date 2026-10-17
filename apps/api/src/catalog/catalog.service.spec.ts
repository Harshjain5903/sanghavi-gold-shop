import { NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { Role } from '../auth/roles';
import { RatesService } from '../rates/rates.service';
import { CatalogService } from './catalog.service';
import { ProductInputDto } from './dto/product-input.dto';
import { Product, ProductDraft } from './product.entity';
import { ProductRepository } from './product.repository';

class InMemoryProductRepository extends ProductRepository {
  rows = new Map<string, Product>();
  findAllCalls = 0;
  private nextId = 1;

  async findAll() {
    this.findAllCalls++;
    return [...this.rows.values()];
  }
  async findById(id: string) {
    return this.rows.get(id) ?? null;
  }
  async create(draft: ProductDraft) {
    const product: Product = { ...draft, id: `p${this.nextId++}`, createdAt: new Date(), updatedAt: new Date() };
    this.rows.set(product.id, product);
    return product;
  }
  async update(id: string, draft: ProductDraft) {
    const existing = this.rows.get(id);
    if (!existing) return null;
    const product = { ...existing, ...draft, updatedAt: new Date() };
    this.rows.set(id, product);
    return product;
  }
  async delete(id: string) {
    const existing = this.rows.get(id) ?? null;
    this.rows.delete(id);
    return existing;
  }
}

const ADMIN: AuthUser = { uid: 'a', email: 'admin@shop.com', emailVerified: true, role: Role.Admin };

const input = (overrides: Partial<ProductInputDto['pricing']> = {}, weight?: string): ProductInputDto => ({
  name: ' Silver Kada ',
  category: ['Silver'],
  images: ['https://res.cloudinary.com/x/kada.jpg'],
  weight,
  pricing: {
    metalPurity: 'SILVER',
    netWeightGrams: 30,
    makingChargeType: 'PER_GRAM',
    makingChargeValue: 15,
    stoneValue: 0,
    priceOnRequest: false,
    ...overrides,
  },
});

describe('CatalogService', () => {
  let repo: InMemoryProductRepository;
  let rateListeners: (() => void)[];
  let silverRate: number;
  let service: CatalogService;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    rateListeners = [];
    silverRate = 90;
    const rates = {
      currentPerGram: async () => ({ GOLD_24K: 0, GOLD_22K: 0, GOLD_18K: 0, SILVER: silverRate }),
      onChange: (listener: () => void) => rateListeners.push(listener),
    } as unknown as RatesService;
    service = new CatalogService(repo, rates, { record: jest.fn() } as unknown as AuditService);
  });

  it('computes the price on read: 30 g × ₹90 + ₹15/g making + 3% GST', async () => {
    const created = await service.create(ADMIN, input());
    expect(created).toMatchObject({ name: 'Silver Kada', price: 3245, priceOnRequest: false, weight: '30g' });
  });

  it('keeps the admin weight label separate from the displayed weight', async () => {
    const plain = await service.create(ADMIN, input());
    const labelled = await service.create(ADMIN, input({}, '27.39 grams'));
    expect(plain).toMatchObject({ weight: '30g', weightLabel: null });
    expect(labelled).toMatchObject({ weight: '27.39 grams', weightLabel: '27.39 grams' });
  });

  it('shows Price on Request when the admin forces it', async () => {
    expect(await service.create(ADMIN, input({ priceOnRequest: true }))).toMatchObject({ price: 0, priceOnRequest: true });
  });

  it('caches the list, and drops the cache on product or rate changes', async () => {
    await service.create(ADMIN, input());
    await service.list();
    await service.list();
    expect(repo.findAllCalls).toBe(1);

    silverRate = 100;
    rateListeners.forEach((listener) => listener());
    expect((await service.list())[0].price).toBe(3554); // (3000 + 450) × 1.03 = 3553.5, rounded
    expect(repo.findAllCalls).toBe(2);
  });

  it('returns 404 for unknown products on get, update and delete', async () => {
    await expect(service.get('missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update(ADMIN, 'missing', input())).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(ADMIN, 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
