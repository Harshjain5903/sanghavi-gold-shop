// One-off import of products and metal rates from Firestore into Postgres.
// Safe to re-run: products are upserted by their existing Firestore id, so
// product links (/#/product/<id>) keep working. Firestore is only read.
//
//   node scripts/import-firestore-catalog.mjs           # preview, writes nothing
//   node scripts/import-firestore-catalog.mjs --apply   # write to DATABASE_URL
//
// Imported products start as "Price on Request": an admin fills in making
// charges, then unticks it, so no piece goes live with an unchecked price.
import { PrismaClient } from '@prisma/client';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

process.loadEnvFile();
const apply = process.argv.includes('--apply');

initializeApp({
  credential: cert(JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'))),
});
const firestore = getFirestore();
const prisma = new PrismaClient();

const specValue = (specs, match) =>
  (Array.isArray(specs) ? specs : []).find((s) => match(String(s?.key ?? '').toLowerCase()))?.value ?? '';

const parseGrams = (text) => {
  const match = String(text ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  const grams = match ? Number(match[1]) : NaN;
  return grams > 0 && grams < 100000 ? grams : null;
};

const parsePurity = (product) => {
  const text = [product.purity, specValue(product.specifications, (k) => k === 'purity'), specValue(product.specifications, (k) => k.includes('material')), ...(product.category ?? [])]
    .join(' ')
    .toLowerCase();
  if (/silver|925|999 ?silver/.test(text)) return 'SILVER';
  if (/24 ?k|999/.test(text)) return 'GOLD_24K';
  if (/22 ?k|916/.test(text)) return 'GOLD_22K';
  if (/18 ?k|750/.test(text)) return 'GOLD_18K';
  return 'NONE';
};

const isHttpsUrl = (url) => typeof url === 'string' && url.startsWith('https://');

const toProduct = (id, p) => {
  const images = (Array.isArray(p.images) && p.images.length ? p.images : [p.image]).filter(isHttpsUrl);
  const netWeightGrams =
    parseGrams(specValue(p.specifications, (k) => k.includes('net weight'))) ?? parseGrams(p.weight);
  return {
    id,
    name: String(p.name ?? '').trim() || 'Untitled product',
    description: String(p.description ?? ''),
    categories: (Array.isArray(p.category) ? p.category : [p.category]).filter(Boolean).map((c) => String(c).trim()),
    subcategory: p.subcategory ? String(p.subcategory).trim() : null,
    images,
    videos: (Array.isArray(p.videos) ? p.videos : []).filter(isHttpsUrl),
    specifications: (Array.isArray(p.specifications) ? p.specifications : []).map((s) => ({ key: String(s.key ?? ''), value: String(s.value ?? '') })),
    weightLabel: p.weight ? String(p.weight).trim() || null : null,
    cardDisplayMode: ['price', 'weight', 'none'].includes(p.cardDisplayMode) ? p.cardDisplayMode : 'price',
    inStock: p.inStock !== false,
    isNew: p.isNew === true,
    isTrending: p.isTrending === true,
    isFeaturedCollection: p.isFeaturedCollection === true,
    metalPurity: parsePurity(p),
    netWeightGrams,
    makingChargeType: 'PERCENT',
    makingChargeValue: 0,
    stoneValue: 0,
    priceOnRequest: true,
  };
};

const products = (await firestore.collection('products').get()).docs.map((d) => toProduct(d.id, d.data()));
console.table(products.map((p) => ({ id: p.id.slice(0, 8), name: p.name.slice(0, 28), purity: p.metalPurity, netWeightG: p.netWeightGrams, images: p.images.length, trending: p.isTrending, featured: p.isFeaturedCollection })));

const rates = (await firestore.doc('settings/rates').get()).data() ?? {};
const existingSnapshot = await prisma.metalRateSnapshot.findFirst();
console.log(`Rates in Firestore: 22K ₹${rates.gold22k ?? 0}/g, 24K ₹${rates.gold24k ?? 0}/g, 18K ₹${rates.gold18k ?? 0}/g, silver ₹${rates.silver ?? 0}/g` + (existingSnapshot ? ' (Postgres already has rates; not overwriting)' : ''));

if (!apply) {
  console.log(`\nPreview only. ${products.length} products would be imported. Re-run with --apply to write.`);
} else {
  for (const { id, ...data } of products) {
    await prisma.product.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
  if (!existingSnapshot) {
    await prisma.metalRateSnapshot.create({
      data: {
        gold24kPerGram: Number(rates.gold24k) || 0,
        gold22kPerGram: Number(rates.gold22k) || 0,
        gold18kPerGram: Number(rates.gold18k) || 0,
        silverPerGram: Number(rates.silver) || 0,
        goldDisplayUnit: rates.goldDisplayUnit || '10g',
        silverDisplayUnit: rates.silverDisplayUnit || '1kg',
        createdByEmail: 'import:firestore',
      },
    });
  }
  await prisma.auditLog.create({
    data: { actorUid: 'system', actorEmail: 'import:firestore', action: 'CATALOG_IMPORTED', targetType: 'product', targetId: '*', metadata: { products: products.length } },
  });
  console.log(`\nImported ${products.length} products into Postgres.`);
}
await prisma.$disconnect();
