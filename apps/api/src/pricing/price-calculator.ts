import { MetalPurity } from '@prisma/client';
import { MakingChargeType, makingChargeStrategyFor } from './making-charge.strategy';

export { MetalPurity };

/** Retail GST on jewellery in India. */
export const JEWELLERY_GST_RATE = 0.03;

export interface PricingInput {
  metalPurity: MetalPurity;
  netWeightGrams: number | null;
  makingChargeType: MakingChargeType;
  makingChargeValue: number;
  stoneValue: number;
  priceOnRequest: boolean;
}

/** Today's rate in ₹ per gram for each purity. */
export type RatesPerGram = Record<Exclude<MetalPurity, 'NONE'>, number>;

export interface PriceBreakdown {
  ratePerGram: number;
  netWeightGrams: number;
  metalValue: number;
  makingCharge: number;
  stoneValue: number;
  subtotal: number;
  gst: number;
  /** Final price, rounded to the nearest rupee. */
  total: number;
}

const rupees = (paise: number): number => Math.round(paise) / 100;

/**
 * Price = metal rate × net weight + making charge + stone value, plus 3% GST.
 * Returns null when the piece can't be priced automatically (shown as "Price on Request").
 */
export class PriceCalculator {
  calculate(input: PricingInput, rates: RatesPerGram): PriceBreakdown | null {
    if (input.priceOnRequest || input.metalPurity === MetalPurity.NONE) return null;
    const netWeightGrams = input.netWeightGrams ?? 0;
    const ratePerGram = rates[input.metalPurity];
    if (!(netWeightGrams > 0) || !(ratePerGram > 0)) return null;

    const metalValuePaise = Math.round(ratePerGram * 100 * netWeightGrams);
    const makingPaise = makingChargeStrategyFor(input.makingChargeType).chargePaise({
      netWeightGrams,
      metalValuePaise,
      value: input.makingChargeValue,
    });
    const stonePaise = Math.round(input.stoneValue * 100);
    const subtotalPaise = metalValuePaise + makingPaise + stonePaise;
    const gstPaise = Math.round(subtotalPaise * JEWELLERY_GST_RATE);

    return {
      ratePerGram,
      netWeightGrams,
      metalValue: rupees(metalValuePaise),
      makingCharge: rupees(makingPaise),
      stoneValue: rupees(stonePaise),
      subtotal: rupees(subtotalPaise),
      gst: rupees(gstPaise),
      total: Math.round((subtotalPaise + gstPaise) / 100),
    };
  }
}
