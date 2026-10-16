import { Injectable } from '@nestjs/common';
import { MetalRateSnapshot } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AuthUser } from '../auth/auth-user';
import { RatesPerGram } from '../pricing/price-calculator';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRatesDto } from './dto/update-rates.dto';

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

@Injectable()
export class RatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async current(): Promise<RatesView> {
    const latest = await this.prisma.metalRateSnapshot.findFirst({ orderBy: { createdAt: 'desc' } });
    return latest ? this.toView(latest) : EMPTY_RATES;
  }

  async currentPerGram(): Promise<RatesPerGram> {
    const rates = await this.current();
    return { GOLD_24K: rates.gold24k, GOLD_22K: rates.gold22k, GOLD_18K: rates.gold18k, SILVER: rates.silver };
  }

  async update(actor: AuthUser, input: UpdateRatesDto): Promise<RatesView> {
    const previous = await this.current();
    const snapshot = await this.prisma.metalRateSnapshot.create({
      data: {
        gold24kPerGram: input.gold24k,
        gold22kPerGram: input.gold22k,
        gold18kPerGram: input.gold18k,
        silverPerGram: input.silver,
        goldDisplayUnit: input.goldDisplayUnit,
        silverDisplayUnit: input.silverDisplayUnit,
        createdByEmail: actor.email,
      },
    });
    const next = this.toView(snapshot);
    await this.audit.record(actor, {
      action: 'METAL_RATES_UPDATED',
      targetType: 'metal_rates',
      targetId: snapshot.id,
      metadata: { from: previous, to: next },
    });
    return next;
  }

  private toView(snapshot: MetalRateSnapshot): RatesView {
    return {
      gold24k: Number(snapshot.gold24kPerGram),
      gold22k: Number(snapshot.gold22kPerGram),
      gold18k: Number(snapshot.gold18kPerGram),
      silver: Number(snapshot.silverPerGram),
      goldDisplayUnit: snapshot.goldDisplayUnit,
      silverDisplayUnit: snapshot.silverDisplayUnit,
      updatedAt: snapshot.createdAt.toISOString(),
    };
  }
}
