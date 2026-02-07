export enum Category {
  ALL = 'All',
  RINGS = 'Rings',
  EARRINGS = 'Earrings',
  BRACELETS_BANGLES = 'Bracelets & Bangles',
  SOLITAIRES = 'Solitaires',
  MANGALSUTRAS = 'Mangalsutras',
  NECKLACES_PENDANTS = 'Necklaces & Pendants',
  SILVER = 'Silver',
  GIFTING = 'Gifting',
  COLLECTIONS = 'Collections',
  MORE_JEWELLERY = 'More Jewellery',
  TRENDING = 'Trending'
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For discount display
  priceOnRequest?: boolean; // New: If true, hide price and show Inquiry button
  cardDisplayMode?: 'price' | 'weight' | 'none';
  category: string[]; // Changed from enum array to string array to support dynamic categories
  subcategory?: string; // e.g., "Studs", "Jhumkas", "Chains"
  image: string; // Keep for backward compatibility (serves as primary image)
  images?: string[]; // New: Multiple images support
  videos?: string[]; // Optional: Product videos
  weight?: string; // Legacy support
  purity?: string; // Legacy support
  specifications?: ProductSpecification[]; // New Dynamic Specs
  description: string;
  isNew?: boolean;
  isTrending?: boolean; // Existing Trending Flag
  isFeaturedCollection?: boolean; // New: For Homepage Hero Slider
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface MegaMenuSection {
  title: string;
  items: string[];
}

export interface NavItem {
  label: string;
  category: string; // Changed to string for flexibility
  sections: MegaMenuSection[];
  image?: string; // For the featured image in dropdown
}

export interface ShopInfo {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  since: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface MetalRates {
  gold22k: number;
  gold24k: number;
  gold18k: number;
  silver: number;
  goldDisplayUnit?: '1g' | '10g' | '100g' | '1kg';
  silverDisplayUnit?: '1g' | '10g' | '100g' | '1kg';
  updatedAt?: string;
}