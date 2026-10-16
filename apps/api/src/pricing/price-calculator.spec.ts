import { MakingChargeType } from './making-charge.strategy';
import { MetalPurity, PriceCalculator, PricingInput, RatesPerGram } from './price-calculator';

const rates: RatesPerGram = { GOLD_24K: 7600, GOLD_22K: 7000, GOLD_18K: 5700, SILVER: 90 };
const ring: PricingInput = {
  metalPurity: MetalPurity.GOLD_22K,
  netWeightGrams: 5.2,
  makingChargeType: MakingChargeType.PERCENT,
  makingChargeValue: 12,
  stoneValue: 2000,
  priceOnRequest: false,
};

describe('PriceCalculator', () => {
  const calculator = new PriceCalculator();

  it('prices a 22K ring: rate × weight + 12% making + stone + 3% GST', () => {
    expect(calculator.calculate(ring, rates)).toEqual({
      ratePerGram: 7000,
      netWeightGrams: 5.2,
      metalValue: 36400,
      makingCharge: 4368,
      stoneValue: 2000,
      subtotal: 42768,
      gst: 1283.04,
      total: 44051,
    });
  });

  it('supports per-gram and flat making charges', () => {
    expect(calculator.calculate({ ...ring, makingChargeType: MakingChargeType.PER_GRAM, makingChargeValue: 500 }, rates)?.makingCharge).toBe(2600);
    expect(calculator.calculate({ ...ring, makingChargeType: MakingChargeType.FLAT, makingChargeValue: 1500 }, rates)?.makingCharge).toBe(1500);
  });

  it('follows the gold rate: a rate change changes the price', () => {
    const higher = calculator.calculate(ring, { ...rates, GOLD_22K: 7100 })!;
    expect(higher.total).toBeGreaterThan(calculator.calculate(ring, rates)!.total);
  });

  it('returns null (Price on Request) when it cannot price the piece', () => {
    expect(calculator.calculate({ ...ring, priceOnRequest: true }, rates)).toBeNull();
    expect(calculator.calculate({ ...ring, netWeightGrams: null }, rates)).toBeNull();
    expect(calculator.calculate({ ...ring, metalPurity: MetalPurity.NONE }, rates)).toBeNull();
    expect(calculator.calculate(ring, { ...rates, GOLD_22K: 0 })).toBeNull();
  });

  it('prices silver by its own rate', () => {
    const anklet = calculator.calculate({ ...ring, metalPurity: MetalPurity.SILVER, netWeightGrams: 40, stoneValue: 0 }, rates)!;
    expect(anklet.metalValue).toBe(3600);
  });
});
