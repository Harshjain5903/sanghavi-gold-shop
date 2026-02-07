import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ProductCard from './components/ProductCard';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import StoreShowcase from './components/StoreShowcase';
import { TRUST_FEATURES } from './constants';
import { Category, Product } from './types';
import { ArrowRight, Filter, ChevronDown, X, ArrowUpDown, Check, Search, Sparkles, Frown } from 'lucide-react';
import { useProducts } from './context/ProductContext';
import { useCategories } from './context/CategoryContext';

// --- ScrollToTop Helper Component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- SEMANTIC RELATIONSHIP MAPPING ---
// This defines which categories are "cousins". 
// Used to boost scores of related items if exact matches are found.
const RELATED_CATEGORIES: Record<string, string[]> = {
  'rings': ['solitaires', 'bands', 'engagement', 'wedding'],
  'bangles': ['bracelets', 'kadas', 'wristwear'],
  'bracelets': ['bangles', 'kadas', 'wristwear'],
  'necklaces': ['pendants', 'chains', 'chokers', 'mangalsutras'],
  'earrings': ['studs', 'jhumkas', 'drops', 'hoops'],
  'mangalsutras': ['necklaces', 'pendants', 'black beads'],
  'silver': ['idols', 'coins', 'utensils']
};

// --- Page Components ---

const HomePage = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const navigate = useNavigate();

  // Filter for trending products. If none marked, fall back to first 4
  const trendingProducts = products.filter(p => p.isTrending);
  const displayProducts = trendingProducts.length > 0 ? trendingProducts : products.slice(0, 4);

  return (
    <>
      {/* 1. Mobile Horizontal Category Scroller (Quick Nav like Instagram Stories) */}
      <div className="md:hidden bg-white pt-6 pb-6 z-30 shadow-sm overflow-x-auto scrollbar-hide border-b border-gray-100">
        <div className="flex gap-4 px-4 min-w-max">
           {categories.map((item, idx) => (
             <div 
               key={idx} 
               onClick={() => navigate(`/collections?category=${item.category}`)}
               className="flex flex-col items-center gap-2 cursor-pointer group w-[72px] flex-shrink-0"
             >
                <div className="w-[72px] h-[72px] rounded-2xl p-[2px] border border-gray-100 group-hover:border-gold-500 transition-all overflow-hidden bg-gray-50 shadow-sm relative">
                  <img 
                    src={item.image} 
                    alt={item.label} 
                    className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.backgroundColor = '#f3f4f6';
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tight text-center leading-tight w-full px-0.5 line-clamp-2 break-words">
                  {item.category === 'Bracelets & Bangles' ? 'Bangles' : item.category}
                </span>
             </div>
           ))}
        </div>
      </div>

      {/* 2. Hero Slider (Visual Hook) */}
      <Hero />
      
      {/* 3. Trust Factors (Reassurance Strip) */}
      <section className="py-6 md:py-10 bg-[#faf9f6] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {TRUST_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300 group cursor-default">
                        <div className="w-12 h-12 bg-white border border-gray-100 md:bg-gold-50/50 text-gold-600 rounded-full flex items-center justify-center mb-3 md:mb-0 md:mr-4 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-white transition-all shadow-sm">
                            <feature.icon size={20} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                           <h3 className="font-sans font-bold text-gray-900 text-sm leading-tight mb-1">{feature.title}</h3>
                           <p className="text-[11px] text-gray-500 font-medium">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. Trending Now (Moved UP - Content First Strategy) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                 <div>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-brand-black">Trending Now</h2>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Most loved designs by our customers</p>
                 </div>
                 <Link to="/collections" className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-black border-b-2 border-brand-black pb-1 hover:text-gold-600 hover:border-gold-600 transition group">
                    View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                 </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
             <div className="mt-8 text-center md:hidden">
                 <Link to="/collections" className="inline-block text-sm font-bold text-brand-black border-2 border-brand-black px-6 py-3 rounded-full hover:bg-brand-black hover:text-white transition">
                    View All Trending
                 </Link>
            </div>
        </div>
      </section>

      {/* 5. Shop By Category (Exploration) */}
      <section className="py-16 bg-brand-light relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 md:mb-14">
                <span className="text-gold-600 font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Collections</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-black mb-4">Shop By Category</h2>
                <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        name: 'Rings', 
                        img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600', 
                        link: Category.RINGS,
                        desc: 'Solitaires, Bands & More'
                    },
                    { 
                        name: 'Necklaces', 
                        img: 'https://drive.google.com/thumbnail?id=1P6ZYnPgg0exGXMovicx_fprQ1zVUOX09&sz=s1000', 
                        link: Category.NECKLACES_PENDANTS,
                        desc: 'Traditional & Modern'
                    },
                    { 
                        name: 'Bracelets', 
                        img: 'https://drive.google.com/thumbnail?id=10s_rMckKIKGh741Py84pSRef0M2GrYNV&sz=s1000', 
                        link: Category.BRACELETS_BANGLES,
                        desc: 'Bangles, Kadas & More'
                    }
                ].map((cat, idx) => (
                    <Link to={`/collections?category=${cat.link}`} key={idx} className="group relative h-64 md:h-[400px] overflow-hidden rounded-2xl shadow-xl cursor-pointer bg-gray-200">
                        <img 
                            src={cat.img} 
                            alt={cat.name} 
                            className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition duration-500" />
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform translate-y-2 group-hover:translate-y-0 transition duration-500">
                            <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">{cat.name}</h3>
                            <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition duration-500 delay-100">{cat.desc}</p>
                            <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-black bg-white px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-gold-500 hover:text-white transition">
                                Explore <ArrowRight size={14} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
             <div className="text-center mt-12">
                <Link to="/collections" className="inline-flex items-center text-gray-900 font-bold hover:text-gold-600 transition text-sm md:text-base border-b border-gray-300 hover:border-gold-600 pb-1">
                    View All Categories <ArrowRight size={18} className="ml-2" />
                </Link>
            </div>
          </div>
      </section>

      {/* 6. Store Showcase Section (The Anchor) */}
      <StoreShowcase />
    </>
  );
};

// --- FILTERS COMPONENT ---
interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (option: string) => void;
  isOpenDefault?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, options, selected, onChange, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-gray-100 py-4">
      <button 
        className="flex justify-between items-center w-full text-left mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">{title}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="space-y-2 mt-2">
          {options.map(option => (
            <label key={option} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 border rounded flex items-center justify-center transition ${selected.includes(option) ? 'bg-gold-500 border-gold-500' : 'border-gray-300 group-hover:border-gold-500'}`}>
                {selected.includes(option) && <Check size={10} className="text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={selected.includes(option)}
                onChange={() => onChange(option)}
              />
              <span className={`text-sm ${selected.includes(option) ? 'text-brand-black font-bold' : 'text-gray-600'}`}>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CollectionsPage = () => {
    const { products } = useProducts();
    const { categories } = useCategories();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const searchQuery = searchParams.get('search');

    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    
    // Search State
    const [searchStatus, setSearchStatus] = useState<'exact' | 'similar' | 'fallback'>('exact');
    
    // Dynamic Filter State
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

    // Reset filters when main category changes
    useEffect(() => {
        setSelectedFilters({});
    }, [categoryParam]);

    // Get current category config to build sidebar
    const currentCategoryConfig = categories.find(c => c.category === categoryParam);

    // --- INTELLIGENT SEARCH & FILTER ENGINE ---
    useEffect(() => {
        let result = products;

        // 1. ADVANCED SEARCH LOGIC
        if (searchQuery) {
            const cleanQuery = searchQuery.toLowerCase().trim();
            const queryTokens = cleanQuery.split(' ').filter(t => t.length > 2);
            
            // Helper: Singularize (simple version for 'rings' -> 'ring')
            const singularize = (word: string) => word.replace(/s$/, '');
            const singularTokens = queryTokens.map(singularize);
            const singularQuery = singularize(cleanQuery);

            // Step A: Calculate Relevance Score for every product
            const scoredProducts = result.map(p => {
                let score = 0;
                
                const pName = p.name.toLowerCase();
                const pCats = p.category.map(c => c.toLowerCase());
                const pSub = (p.subcategory || '').toLowerCase();
                const pDesc = p.description.toLowerCase();

                // 1. EXACT & PHRASE MATCHING (Highest Priority)
                if (pName === cleanQuery) score += 150; // Perfect name match
                else if (pName.includes(cleanQuery)) score += 100; // Contains full query phrase
                else if (pCats.includes(singularQuery)) score += 80; // Category match (e.g. search "Ring" -> Category "Rings")
                else if (pSub === singularQuery) score += 90; // Subcategory match (e.g. search "Choker")

                // 2. TOKEN MATCHING (Medium Priority)
                queryTokens.forEach(token => {
                    if (pName.includes(token)) score += 40;
                    if (pCats.some(c => c.includes(token))) score += 30;
                    if (pSub.includes(token)) score += 35;
                });

                // 3. SEMANTIC RELATIONSHIP (Context Priority)
                // If searching "Bangles", give small boost to "Bracelets" so they appear AFTER bangles, but BEFORE Mangalsutras.
                const relatedTerms = RELATED_CATEGORIES[singularQuery] || [];
                if (relatedTerms.some(term => pCats.some(c => c.includes(term)) || pSub.includes(term))) {
                    score += 15; // Small boost for cousins
                }

                // 4. DESCRIPTION MATCH (Low Priority)
                if (pDesc.includes(cleanQuery)) score += 10;
                else if (queryTokens.some(t => pDesc.includes(t))) score += 5;

                return { product: p, score };
            });

            // Step B: Filter out irrelevant items (Score > 0) and Sort
            // Sort by Score DESC. If scores equal, prioritize "Trending" items.
            let matchedProducts = scoredProducts
                .filter(item => item.score > 0)
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return (b.product.isTrending ? 1 : 0) - (a.product.isTrending ? 1 : 0);
                })
                .map(item => item.product);

            if (matchedProducts.length > 0) {
                result = matchedProducts;
                // If top match has a high score (>50), it's a good match.
                setSearchStatus(scoredProducts.some(i => i.score > 50) ? 'exact' : 'similar');
            } else {
                // Step C: Fallback to Trending if absolutely nothing found
                result = products.filter(p => p.isTrending).slice(0, 12);
                setSearchStatus('fallback');
            }
        } 
        // 2. STANDARD CATEGORY FILTERING (With Robust Matching)
        else {
            setSearchStatus('exact');
            if (categoryParam && categoryParam !== 'All') {
                // FIX: Enhanced Case-Insensitive and Partial Matching
                // This solves the issue where "Men's Silver Jewellery" (URL) didn't match "Men's Silver Jewellery" (Product)
                // due to encoding or slight variations.
                const decodedParam = decodeURIComponent(categoryParam).toLowerCase().trim();
                
                result = result.filter(p => 
                    p.category.some(c => {
                        const productCat = c.toLowerCase().trim();
                        // 1. Direct match (normalized)
                        if (productCat === decodedParam) return true;
                        // 2. Contains match (e.g. param "Silver" matches product "Men's Silver")
                        if (productCat.includes(decodedParam) || decodedParam.includes(productCat)) return true;
                        
                        return false;
                    })
                );
            }
            if (subcategoryParam) {
                const decodedSubParam = decodeURIComponent(subcategoryParam).toLowerCase().trim();
                result = result.filter(p => {
                    const pSub = (p.subcategory || '').toLowerCase().trim();
                    const catMatch = p.category.some(c => {
                        const productCat = c.toLowerCase().trim();
                        return productCat.includes(decodedSubParam) || decodedSubParam.includes(productCat);
                    });

                    return (
                        pSub === decodedSubParam ||
                        (pSub && pSub.includes(decodedSubParam)) ||
                        (decodedSubParam && decodedSubParam.includes(pSub)) ||
                        catMatch
                    );
                });
            }
        }

        // 3. APPLY SIDEBAR FILTERS (On top of search or category results)
        Object.entries(selectedFilters).forEach(([sectionTitle, selectedOptions]) => {
            const options = selectedOptions as string[];
            if (options.length > 0) {
                 result = result.filter(p => {
                     return options.some(opt => 
                        (() => {
                            const optNorm = opt.toLowerCase().trim();
                            const pSub = (p.subcategory || '').toLowerCase().trim();
                            const catMatch = p.category.some(c => {
                                const productCat = c.toLowerCase().trim();
                                return productCat.includes(optNorm) || optNorm.includes(productCat);
                            });

                            return (
                                pSub === optNorm ||
                                (pSub && pSub.includes(optNorm)) ||
                                (optNorm && optNorm.includes(pSub)) ||
                                catMatch ||
                                (sectionTitle.toLowerCase().includes("price") ? true : false)
                            );
                        })()
                     );
                 });
            }
        });

        setFilteredProducts(result);
    }, [categoryParam, subcategoryParam, searchQuery, products, selectedFilters, categories]);

    const toggleDynamicFilter = (sectionTitle: string, option: string) => {
        setSelectedFilters(prev => {
            const currentSelected = prev[sectionTitle] || [];
            if (currentSelected.includes(option)) {
                return { ...prev, [sectionTitle]: currentSelected.filter(i => i !== option) };
            } else {
                return { ...prev, [sectionTitle]: [...currentSelected, option] };
            }
        });
    };

    return (
        <div className="bg-white min-h-screen">
            
            {/* 1. Page Header */}
            <div className="bg-brand-light border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-xs text-gray-500 mb-2">
                        Home / {searchQuery ? `Search` : (categoryParam ? decodeURIComponent(categoryParam) : 'All Jewellery')} {subcategoryParam && `/ ${subcategoryParam}`}
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-2">
                        <div>
                             {searchQuery ? (
                                <>
                                    {searchStatus === 'exact' && (
                                        <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
                                            Results for "{searchQuery}"
                                        </h1>
                                    )}
                                    {searchStatus === 'similar' && (
                                        <div>
                                            <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                                <Sparkles className="text-gold-500" size={24} /> 
                                                Related to "{searchQuery}"
                                            </h1>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Showing closest matches found in our collection.
                                            </p>
                                        </div>
                                    )}
                                    {searchStatus === 'fallback' && (
                                        <div>
                                            <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                                <Frown className="text-gray-400" size={24} /> 
                                                No matches for "{searchQuery}"
                                            </h1>
                                            <p className="text-sm text-gray-600 mt-1 font-medium">
                                                But check out our <span className="text-gold-600 font-bold">Best Selling</span> items below!
                                            </p>
                                        </div>
                                    )}
                                </>
                             ) : (
                                <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
                                    {subcategoryParam || (categoryParam ? decodeURIComponent(categoryParam) : 'All Collections')}
                                </h1>
                             )}
                        </div>
                        <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                            {filteredProducts.length} Designs
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-8">
                    
                    {/* 2. SIDEBAR FILTERS (Desktop Only) */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white pr-4 sticky top-24">
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Filter By</h3>
                            
                            {/* Dynamic Filters based on Navigation Config */}
                            {currentCategoryConfig ? (
                                currentCategoryConfig.sections.map((section, idx) => (
                                    <FilterSection 
                                        key={idx}
                                        title={section.title}
                                        options={section.items}
                                        selected={selectedFilters[section.title] || []}
                                        onChange={(val) => toggleDynamicFilter(section.title, val)}
                                        isOpenDefault={idx < 2}
                                    />
                                ))
                            ) : (
                                <>
                                  <FilterSection 
                                    title="Price" 
                                    options={['Under ₹20,000', '₹20,000 - ₹50,000', 'Above ₹50,000']}
                                    selected={selectedFilters['Price'] || []}
                                    onChange={(val) => toggleDynamicFilter('Price', val)}
                                    isOpenDefault={true}
                                  />
                                   <FilterSection 
                                    title="Material" 
                                    options={['Gold', 'Diamond', 'Silver']}
                                    selected={selectedFilters['Material'] || []}
                                    onChange={(val) => toggleDynamicFilter('Material', val)}
                                    isOpenDefault={true}
                                  />
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. PRODUCT GRID */}
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-gray-500 mb-2">No products match your criteria.</p>
                                <button 
                                    onClick={() => setSelectedFilters({})} 
                                    className="text-gold-600 font-bold underline text-sm"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* 4. MOBILE BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <button 
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="py-4 flex items-center justify-center gap-2 font-bold text-gray-800 text-sm uppercase tracking-wide active:bg-gray-50"
                    >
                        <Filter size={16} /> Filter
                    </button>
                    <button className="py-4 flex items-center justify-center gap-2 font-bold text-gray-800 text-sm uppercase tracking-wide active:bg-gray-50">
                        <ArrowUpDown size={16} /> Sort
                    </button>
                </div>
            </div>

            {/* 5. MOBILE FILTER DRAWER */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)} />
                    <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-xl h-[80vh] flex flex-col animate-fade-in-up">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {currentCategoryConfig ? (
                                currentCategoryConfig.sections.map((section, idx) => (
                                    <FilterSection 
                                        key={idx}
                                        title={section.title}
                                        options={section.items}
                                        selected={selectedFilters[section.title] || []}
                                        onChange={(val) => toggleDynamicFilter(section.title, val)}
                                        isOpenDefault={idx < 1}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Select a category to see specific filters.</p>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 flex gap-4">
                            <button 
                                onClick={() => { setSelectedFilters({}); setIsMobileFilterOpen(false); }}
                                className="flex-1 py-3 border border-gray-300 rounded font-bold text-gray-600"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="flex-1 py-3 bg-brand-black text-white rounded font-bold"
                            >
                                Apply ({filteredProducts.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>
              <Footer />
              <FloatingWhatsApp />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;