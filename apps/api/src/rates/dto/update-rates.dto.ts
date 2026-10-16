import { IsIn, IsNumber, Max, Min } from 'class-validator';

const DISPLAY_UNITS = ['1g', '10g', '100g', '1kg'] as const;
type DisplayUnit = (typeof DISPLAY_UNITS)[number];

/** Rates are ₹ per gram. The display units only control how the website shows them. */
export class UpdateRatesDto {
  @IsNumber() @Min(0) @Max(1_000_000) gold24k: number;
  @IsNumber() @Min(0) @Max(1_000_000) gold22k: number;
  @IsNumber() @Min(0) @Max(1_000_000) gold18k: number;
  @IsNumber() @Min(0) @Max(1_000_000) silver: number;
  @IsIn(DISPLAY_UNITS) goldDisplayUnit: DisplayUnit;
  @IsIn(DISPLAY_UNITS) silverDisplayUnit: DisplayUnit;
}
