import { Category, Product, ShopInfo, NavItem } from './types';
import { Truck, ShieldCheck, Phone, Zap } from 'lucide-react';

export const DEFAULT_METAL_RATES = {
  gold22k: 0,
  gold24k: 0,
  gold18k: 0,
  silver: 0,
  goldDisplayUnit: '10g',
  silverDisplayUnit: '1kg',
  updatedAt: ''
};

export const SHOP_INFO: ShopInfo = {
  name: "Sanghavi Gold",
  phone: "+91 79776 00660",
  whatsapp: "917977600660",
  email: "sanghavigold2002@gmail.com",
  address: "Zojwala Commercial Centre, KE, Mohammad Ali Chowk, Opposite Hotel Vrindavan Residency, Kalyan West, Maharashtra 421301",
  since: "1973",
  instagram: "https://www.instagram.com/sanghavi_gold/",
  facebook: "https://www.facebook.com/people/Sanghavi-Gold/100079120424520/?locale=nl_NL",
  youtube: "https://www.youtube.com/@SanghaviGold/videos"
};

// --- NAVIGATION STRUCTURE (Exact Copy of CaratLane) ---
export const NAV_CONFIG: NavItem[] = [
  {
    label: 'RINGS',
    category: 'Rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    sections: [
      {
        title: 'Featured',
        items: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals']
      },
      {
        title: 'By Style',
        items: ['All Rings', 'Engagement', 'Dailywear', 'Infinity', 'Cocktail', 'Solitaire', 'Couple Rings', 'Bands', 'Promise Rings', 'Silver Rings']
      },
      {
        title: 'By Metal & Stone',
        items: ['Diamond', 'Pearl', 'Navratna', 'Gemstone', 'Platinum', 'Gold', 'Rose Gold', 'Yellow Gold', 'White Gold', '22KT Gold']
      },
      {
        title: 'By Price',
        items: ['Under ₹10k', '₹10k - ₹20k', '₹20k - ₹30k', '₹30k - ₹50k', '₹50k - ₹75k', '₹75k & Above']
      }
    ]
  },
  {
    label: 'EARRINGS',
    category: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    sections: [
      {
        title: 'Featured',
        items: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals']
      },
      {
        title: 'By Style',
        items: ['All Earrings', 'Studs', 'Hoops', 'Drops', 'Earcuffs', 'Sui Dhaga', 'Jhumkas', 'Chandbalis', 'Silver Earrings']
      },
      {
        title: 'By Metal & Stone',
        items: ['Diamond', 'Pearl', 'Navratna', 'Gemstone', 'Platinum', 'Rose Gold', 'Yellow Gold', 'White Gold', '22KT Gold']
      },
      {
        title: 'By Price',
        items: ['Under ₹10k', '₹10k - ₹20k', '₹20k - ₹30k', '₹30k - ₹50k', '₹50k - ₹75k', '₹75k & Above']
      }
    ]
  },
  {
    label: 'BRACELETS & BANGLES',
    category: 'Bracelets & Bangles',
    image: 'https://drive.google.com/thumbnail?id=10s_rMckKIKGh741Py84pSRef0M2GrYNV&sz=s1000',
    sections: [
      {
        title: 'Featured',
        items: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals']
      },
      {
        title: 'By Style',
        items: ['All Bracelets & Bangles', 'Adjustable Bracelets', 'Chain Bracelets', 'Flexible Bracelets', 'Tennis Bracelets', 'Bridal Bangles', 'Lightweight Bangles', 'Silver Bracelets', 'Oval Bracelets']
      },
      {
        title: 'By Metal & Stone',
        items: ['Diamond', 'Gemstone', 'Rose Gold', 'Platinum', 'Pearl', 'Navratna', 'Yellow Gold', 'White Gold', '22kt Gold']
      },
      {
        title: 'By Price',
        items: ['Under ₹10k', '₹10k - ₹20k', '₹20k - ₹30k', '₹30k - ₹50k', '₹50k - ₹75k', 'Above ₹75k']
      }
    ]
  },
  {
    label: 'SOLITAIRES',
    category: 'Solitaires',
    image: 'https://drive.google.com/thumbnail?id=1qbkq24QiP_kBjiktr-vaGfdPqatrodFf&sz=s1000',
    sections: [
      {
        title: 'Featured',
        items: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals']
      },
      {
        title: 'By Style',
        items: ['All Solitaires', 'Rings', 'Earrings', 'Bridal Sets', 'Mangalsutras', 'Pendants', 'Necklaces', 'Bracelets']
      },
      {
        title: 'By Metal & Stones',
        items: ['Diamond', 'Platinum', 'Rose Gold', 'White Gold', 'Yellow Gold']
      },
      {
        title: 'By Price',
        items: ['₹30k to ₹50k', '₹50k to ₹75k', '₹75k to 1L', '₹1L to 1.5L', '₹1.5L to 2L']
      }
    ]
  },
  {
    label: 'MANGALSUTRAS',
    category: 'Mangalsutras',
    image: 'https://drive.google.com/thumbnail?id=1VylHGjhBa-hrZFnJyUCSgxJkT7ut8rwZ&sz=s1000',
    sections: [
      {
        title: 'Featured',
        items: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals']
      },
      {
        title: 'By Style',
        items: ['All Mangalsutras', 'Modern', 'Traditional', 'Solitaire', 'Infinity', 'Fancy', 'Mangalsutra Rings', 'Mangalsutra Bracelets']
      },
      {
        title: 'By Metal & Stone',
        items: ['Diamond', 'Gemstone', 'Platinum', 'Gold', 'Yellow Gold', '22kt Gold']
      },
      {
        title: 'By Price',
        items: ['₹20k to ₹30k', '₹30k to ₹50k', '₹50k to ₹75k', '₹75k and Above']
      }
    ]
  },
  {
    label: 'NECKLACES & PENDANTS',
    category: 'Necklaces & Pendants',
    image: 'https://drive.google.com/thumbnail?id=1P6ZYnPgg0exGXMovicx_fprQ1zVUOX09&sz=s1000',
    sections: [
      {
        title: 'Featured',
        items: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals']
      },
      {
        title: 'By Style',
        items: ['All Necklaces', 'Lightweight', 'Bridal', 'Evil Eye', 'Choker', 'All Pendants', 'Alphabet Pendants', 'Heart Pendants', 'Butterfly Pendants', 'Silver Necklaces']
      },
      {
        title: 'By Metal & Stone',
        items: ['Gold', 'Diamond', 'Pearl', 'Gemstone', 'Yellow Gold', 'Rose Gold', 'White Gold', '22KT Gold', 'Platinum']
      },
      {
        title: 'By Price',
        items: ['Under ₹10k', '₹10k - ₹20k', '₹20k - ₹30k', '₹30k - ₹50k', '₹50k - ₹75k', '₹75k & Above']
      }
    ]
  },
  {
    label: 'SILVER',
    category: 'Silver',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800',
    sections: [
      {
        title: 'By Style',
        items: ['Earrings', 'Necklaces', 'Bracelets', 'Rings', 'Coins & Articles', 'More Styles']
      },
      {
        title: 'Collections',
        items: ['Silver Jewellery for Men', 'Diamond Silver', 'Gifts', 'Shop Everything']
      }
    ]
  },
  {
      label: 'GIFTING',
      category: 'Gifting',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800',
      sections: [
          {
              title: 'By Occasions',
              items: ['Anniversary Gifts', 'Personalised', 'Bracelet & Bangles', 'Charms', 'Earrings', 'Necklaces & Pendants', 'Rings', 'Solitaires']
          },
          {
              title: 'By Price',
              items: ['Under ₹10k', '₹10k to ₹20k', '₹20k to ₹30k', '₹30k to ₹50k', '₹50k to ₹75k', '₹75k & Above']
          },
          {
              title: 'Gifting',
              items: ['Wife', 'Daughter', 'Kids', 'Men', 'Mother', 'Self']
          }
      ]
  },
  {
      label: 'COLLECTIONS',
      category: 'Collections',
      image: 'https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&q=80&w=800',
      sections: [
          {
              title: 'Featured',
              items: ['Utsav', 'Alpona', 'Adaa', 'Butterfly', 'Ombre', 'Aaranya']
          },
          {
              title: 'Designer',
              items: ['Lotus', 'Sol', 'Harry Potter', 'Disney', 'Mogra', 'Blaze']
          },
          {
              title: 'Exclusive',
              items: ['Eternity', 'Kanak', 'Luna', 'Seaborn', 'Mandala', 'Dunes']
          }
      ]
  },
  {
      label: 'MORE JEWELLERY',
      category: 'More Jewellery',
      image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=800',
      sections: [
          {
              title: 'Shop For Women',
              items: ['Nose Rings', 'Nose Pins', 'Watch Charms', 'Charms', '22kt Jewellery', 'Silver Jewellery', 'Platinum Jewellery', 'Gold Chains']
          },
          {
              title: 'Shop For Men',
              items: ['Rings', 'Studs', 'Chains', 'Pendants', 'Bracelets', 'Kadas']
          },
          {
              title: 'Shop For Kids',
              items: ['Earrings', 'Rings', 'Bracelets', 'Necklaces', 'Pendants', 'Baby Bangles']
          },
          {
              title: 'By Metal & Stone',
              items: ['Gold', 'Diamond', 'Pearl', 'Gemstone', 'Yellow Gold', 'Rose Gold', 'White Gold', '22kt Gold', 'Platinum']
          }
      ]
  },
  {
      label: 'TRENDING',
      category: 'Trending',
      image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&q=80&w=800',
      sections: [
          {
              title: 'What\'s Trending',
              items: ['1gm Gold Designs', 'Chain Earrings', 'Diamond Bangles', 'Vanki Rings', 'Evil Eye Bracelets', 'Gold Pendants', 'Rose Gold Designs', 'Platinum Chains']
          }
      ]
  }
];

export const DEFAULT_SORT_OPTIONS: string[] = [
  'Recommended',
  'Price: Low to High',
  'Price: High to Low',
  'Newest',
  'Trending',
  'Name: A to Z',
  'Name: Z to A'
];

export const DEFAULT_FILTER_SECTIONS = [
  {
    title: 'Price',
    items: ['Under ₹20,000', '₹20,000 - ₹50,000', 'Above ₹50,000']
  },
  {
    title: 'Material',
    items: ['Gold', 'Diamond', 'Silver']
  }
];

export const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Certified",
    desc: "HUID Hallmarked"
  },
  {
    icon: Zap,
    title: "100% Exchange",
    desc: "Best value on old gold"
  },
  {
    icon: Truck,
    title: "Insured Shipping",
    desc: "Secure delivery to your door"
  },
  {
    icon: Phone,
    title: "Video Call",
    desc: "Shop live from home"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Antique Gold Bridal Necklace",
    price: 125000,
    category: ["Necklaces & Pendants", "Gold"],
    subcategory: "Necklaces",
    image: "https://drive.google.com/thumbnail?id=1P6ZYnPgg0exGXMovicx_fprQ1zVUOX09&sz=s1000",
    weight: "25g",
    purity: "22kt",
    description: "Traditional antique finish gold necklace perfect for weddings.",
    isNew: true,
    inStock: true
  },
  {
    id: "2",
    name: "Diamond Solitaire Ring",
    price: 45000,
    originalPrice: 50000,
    category: ["Rings", "Diamond", "Solitaires"],
    subcategory: "Solitaire",
    image: "https://drive.google.com/thumbnail?id=1qbkq24QiP_kBjiktr-vaGfdPqatrodFf&sz=s1000",
    weight: "3g",
    purity: "18kt",
    description: "Elegant solitaire diamond ring for engagements.",
    inStock: true
  },
  {
    id: "3",
    name: "Lightweight Gold Bracelet",
    price: 35000,
    category: ["Bracelets & Bangles", "Gold"],
    subcategory: "Chain Bracelets",
    image: "https://drive.google.com/thumbnail?id=10s_rMckKIKGh741Py84pSRef0M2GrYNV&sz=s1000",
    weight: "6g",
    purity: "22kt",
    description: "Daily wear lightweight gold bracelet.",
    isNew: true,
    inStock: true
  },
  {
    id: "4",
    name: "Traditional Maharashtrian Nath",
    price: 15000,
    category: ["More Jewellery", "Gold", "Nose Pins"],
    subcategory: "Nose Pins",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a51?auto=format&fit=crop&q=80&w=600",
    weight: "4g",
    purity: "22kt",
    description: "Classic design with pearls and ruby stones.",
    inStock: true
  }
];