import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** One saved set of metal rates (₹ per gram). Rates are never edited; each change adds a snapshot. */
export interface RateSnapshot {
  id: string;
  gold24kPerGram: number;
  gold22kPerGram: number;
  gold18kPerGram: number;
  silverPerGram: number;
  goldDisplayUnit: string;
  silverDisplayUnit: string;
  createdByEmail: string;
  createdAt: Date;
}

export type NewRateSnapshot = Omit<RateSnapshot, 'id' | 'createdAt'>;

export abstract class RatesRepository {
  abstract latest(): Promise<RateSnapshot | null>;
  abstract add(snapshot: NewRateSnapshot): Promise<RateSnapshot>;
}

@Injectable()
export class PrismaRatesRepository extends RatesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async latest(): Promise<RateSnapshot | null> {
    const row = await this.prisma.metalRateSnapshot.findFirst({ orderBy: { createdAt: 'desc' } });
    return row ? this.toDomain(row) : null;
  }

  async add(snapshot: NewRateSnapshot): Promise<RateSnapshot> {
    return this.toDomain(await this.prisma.metalRateSnapshot.create({ data: snapshot }));
  }

  private toDomain(row: {
    id: string;
    gold24kPerGram: unknown;
    gold22kPerGram: unknown;
    gold18kPerGram: unknown;
    silverPerGram: unknown;
    goldDisplayUnit: string;
    silverDisplayUnit: string;
    createdByEmail: string;
    createdAt: Date;
  }): RateSnapshot {
    return {
      id: row.id,
      gold24kPerGram: Number(row.gold24kPerGram),
      gold22kPerGram: Number(row.gold22kPerGram),
      gold18kPerGram: Number(row.gold18kPerGram),
      silverPerGram: Number(row.silverPerGram),
      goldDisplayUnit: row.goldDisplayUnit,
      silverDisplayUnit: row.silverDisplayUnit,
      createdByEmail: row.createdByEmail,
      createdAt: row.createdAt,
    };
  }
}
