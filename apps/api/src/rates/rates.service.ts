import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { TtlCache } from '../common/ttl-cache';
import { RatesPerGram } from '../pricing/price-calculator';
import { UpdateRatesDto } from './dto/update-rates.dto';
import { RateSnapshot, RatesRepository } from './rates.repository';

/** Same shape the website already uses for metal rates (₹ per gram). */
export interface RatesView {
  gold24k: number;
  gold22k: number;
  gold18k: number;
  silver: number;
  goldDisplayUnit: string;
  silverDisplayUnit: string;
  updatedAt: string;
}

const EMPTY_RATES: RatesView = {
  gold24k: 0,
  gold22k: 0,
  gold18k: 0,
  silver: 0,
  goldDisplayUnit: '10g',
  silverDisplayUnit: '1kg',
  updatedAt: '',
};

type RatesListener = () => void;

@Injectable()
export class RatesService {
  // Rates change at most a few times a day; avoid a database read on every page view.
  private readonly cache = new TtlCache<RatesView>(60_000);
  private readonly listeners: RatesListener[] = [];

  constructor(
    private readonly rates: RatesRepository,
    private readonly audit: AuditService,
  ) {}

  /** Called after rates change (e.g. so the catalog can drop cached prices). */
  onChange(listener: RatesListener): void {
    this.listeners.push(listener);
  }

  current(): Promise<RatesView> {
    return this.cache.get(async () => {
      const latest = await this.rates.latest();
      return latest ? this.toView(latest) : EMPTY_RATES;
    });
  }

  async currentPerGram(): Promise<RatesPerGram> {
    const rates = await this.current();
    return { GOLD_24K: rates.gold24k, GOLD_22K: rates.gold22k, GOLD_18K: rates.gold18k, SILVER: rates.silver };
  }

  async update(actor: AuthUser, input: UpdateRatesDto): Promise<RatesView> {
    const previous = await this.current();
    const snapshot = await this.rates.add({
      gold24kPerGram: input.gold24k,
      gold22kPerGram: input.gold22k,
      gold18kPerGram: input.gold18k,
      silverPerGram: input.silver,
      goldDisplayUnit: input.goldDisplayUnit,
      silverDisplayUnit: input.silverDisplayUnit,
      createdByEmail: actor.email,
    });
    this.cache.invalidate();
    this.listeners.forEach((listener) => listener());

    const next = this.toView(snapshot);
    await this.audit.record(actor, {
      action: 'METAL_RATES_UPDATED',
      targetType: 'metal_rates',
      targetId: snapshot.id,
      metadata: { from: previous, to: next },
    });
    return next;
  }

  private toView(snapshot: RateSnapshot): RatesView {
    return {
      gold24k: snapshot.gold24kPerGram,
      gold22k: snapshot.gold22kPerGram,
      gold18k: snapshot.gold18kPerGram,
      silver: snapshot.silverPerGram,
      goldDisplayUnit: snapshot.goldDisplayUnit,
      silverDisplayUnit: snapshot.silverDisplayUnit,
      updatedAt: snapshot.createdAt.toISOString(),
    };
  }
}
