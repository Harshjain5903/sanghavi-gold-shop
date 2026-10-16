import { MakingChargeType } from '@prisma/client';

export { MakingChargeType };

// Strategy pattern: each way of charging for making is its own class with one job.
// Adding a new style (e.g. "per piece with minimum") means adding one class here.
// All amounts are in paise (integer) to avoid floating-point rounding errors.

export interface MakingChargeStrategy {
  /** Making charge in paise for a piece. */
  chargePaise(input: { netWeightGrams: number; metalValuePaise: number; value: number }): number;
}

/** ₹ per gram of net weight. */
export class PerGramMakingCharge implements MakingChargeStrategy {
  chargePaise({ netWeightGrams, value }: { netWeightGrams: number; value: number }): number {
    return Math.round(value * 100 * netWeightGrams);
  }
}

/** Percentage of the metal value. */
export class PercentMakingCharge implements MakingChargeStrategy {
  chargePaise({ metalValuePaise, value }: { metalValuePaise: number; value: number }): number {
    return Math.round((metalValuePaise * value) / 100);
  }
}

/** Fixed ₹ amount per piece. */
export class FlatMakingCharge implements MakingChargeStrategy {
  chargePaise({ value }: { value: number }): number {
    return Math.round(value * 100);
  }
}

const STRATEGIES: Record<MakingChargeType, MakingChargeStrategy> = {
  [MakingChargeType.PER_GRAM]: new PerGramMakingCharge(),
  [MakingChargeType.PERCENT]: new PercentMakingCharge(),
  [MakingChargeType.FLAT]: new FlatMakingCharge(),
};

export const makingChargeStrategyFor = (type: MakingChargeType): MakingChargeStrategy => STRATEGIES[type];
