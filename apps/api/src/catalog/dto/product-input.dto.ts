import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { MakingChargeType, MetalPurity } from '@prisma/client';

export class SpecificationDto {
  @IsString() @MaxLength(60) key: string;
  @IsString() @MaxLength(300) value: string;
}

export class PricingInputDto {
  @IsEnum(MetalPurity) metalPurity: MetalPurity;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 3 }) @Min(0) @Max(100_000)
  netWeightGrams: number | null;

  @IsEnum(MakingChargeType) makingChargeType: MakingChargeType;
  @IsNumber() @Min(0) @Max(10_000_000) makingChargeValue: number;
  @IsNumber() @Min(0) @Max(100_000_000) stoneValue: number;
  @IsBoolean() priceOnRequest: boolean;
}

/** What an admin sends to create or replace a product. Prices are never sent; they are computed. */
export class ProductInputDto {
  @IsString() @MinLength(1) @MaxLength(200) name: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;

  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(100, { each: true })
  category: string[];

  @IsOptional() @IsString() @MaxLength(100) subcategory?: string;

  @IsArray() @ArrayMaxSize(20) @IsUrl({ protocols: ['https'] }, { each: true })
  images: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsUrl({ protocols: ['https'] }, { each: true })
  videos?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(40) @ValidateNested({ each: true }) @Type(() => SpecificationDto)
  specifications?: SpecificationDto[];

  /** Free-text weight shown on cards, e.g. "12.5g". */
  @IsOptional() @IsString() @MaxLength(40) weight?: string;

  @IsOptional() @IsIn(['price', 'weight', 'none']) cardDisplayMode?: 'price' | 'weight' | 'none';
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsBoolean() isTrending?: boolean;
  @IsOptional() @IsBoolean() isFeaturedCollection?: boolean;

  @ValidateNested() @Type(() => PricingInputDto)
  pricing: PricingInputDto;
}
