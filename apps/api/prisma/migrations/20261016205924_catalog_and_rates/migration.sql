-- CreateEnum
CREATE TYPE "MetalPurity" AS ENUM ('GOLD_24K', 'GOLD_22K', 'GOLD_18K', 'SILVER', 'NONE');

-- CreateEnum
CREATE TYPE "MakingChargeType" AS ENUM ('PER_GRAM', 'PERCENT', 'FLAT');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "categories" TEXT[],
    "subcategory" TEXT,
    "images" TEXT[],
    "videos" TEXT[],
    "specifications" JSONB NOT NULL DEFAULT '[]',
    "metalPurity" "MetalPurity" NOT NULL DEFAULT 'NONE',
    "netWeightGrams" DECIMAL(10,3),
    "weightLabel" TEXT,
    "makingChargeType" "MakingChargeType" NOT NULL DEFAULT 'PERCENT',
    "makingChargeValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stoneValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "cardDisplayMode" TEXT NOT NULL DEFAULT 'price',
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "isFeaturedCollection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metal_rate_snapshots" (
    "id" TEXT NOT NULL,
    "gold24kPerGram" DECIMAL(12,2) NOT NULL,
    "gold22kPerGram" DECIMAL(12,2) NOT NULL,
    "gold18kPerGram" DECIMAL(12,2) NOT NULL,
    "silverPerGram" DECIMAL(12,2) NOT NULL,
    "goldDisplayUnit" TEXT NOT NULL DEFAULT '10g',
    "silverDisplayUnit" TEXT NOT NULL DEFAULT '1kg',
    "createdByEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metal_rate_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- CreateIndex
CREATE INDEX "metal_rate_snapshots_createdAt_idx" ON "metal_rate_snapshots"("createdAt");
