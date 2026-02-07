import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, X, Search, User, MapPin, Phone, ChevronRight, ChevronLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { SHOP_INFO } from '../constants';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

// Custom SG Logo Component using the provided image (with fallback)
export const SanghaviLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div
                className={`rounded-full bg-brand-black text-gold-500 font-serif font-bold flex items-center justify-center ${className}`}
                aria-label="Sanghavi Gold Logo"
            >
                S
            </div>
        );
    }

    return (
        <img
            src="https://drive.google.com/thumbnail?id=1xCtlWC8c-XYbegfLKAMbirqZ7Pkjdewi&sz=s1000"
            alt="Sanghavi Gold Logo"
            className={`object-contain ${className}`}
            onError={() => setFailed(true)}
        />
    );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { categories } = useCategories(); 
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Mobile Menu State
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Build a smart, weighted list of search terms
  const searchCorpus = useMemo(() => {
    const categoryTerms = new Set<string>();
    const productTerms = new Set<string>();

    // 1. High Priority: Categories & Subcategories
    categories.forEach(item => {
      categoryTerms.add(item.label); // e.g. RINGS
      categoryTerms.add(item.category); // e.g. Rings
      item.sections.forEach(section => {
        section.items.forEach(subItem => categoryTerms.add(subItem));
      });
    });

    // 2. Medium Priority: Product Names (First 3 words only to keep suggestions clean)
    products.forEach(p => {
        // Add full name
        productTerms.add(p.name);
        // Add "Adjective + Category" combos (e.g. "Fancy Ring")
        if (p.subcategory) {
             const adj = p.name.split(' ')[0]; // First word often adjective
             productTerms.add(`${adj} ${p.subcategory}`);
        }
    });

    return { 
        categories: Array.from(categoryTerms),
        products: Array.from(productTerms)
    };
  }, [products, categories]);

  // Filter suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const lowerQuery = searchQuery.toLowerCase();
      
      // Filter Categories (Priority 1)
      const matchedCats = searchCorpus.categories.filter(term => 
          term.toLowerCase().includes(lowerQuery)
      ).sort((a, b) => {
          // Prioritize startsWith
          const aStarts = a.toLowerCase().startsWith(lowerQuery);
          const bStarts = b.toLowerCase().startsWith(lowerQuery);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.length - b.length; // Shortest match first
      });

      // Filter Products (Priority 2)
      const matchedProds = searchCorpus.products.filter(term => 
        term.toLowerCase().includes(lowerQuery)
      ).slice(0, 5); // Limit product suggestions

      // Combine: Categories first, then Products
      const finalSuggestions = [...new Set([...matchedCats, ...matchedProds])].slice(0, 8);
      
      setSuggestions(finalSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, searchCorpus]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
      setIsOpen(!isOpen);
      setMobileSubMenu(null);
  };

  const handleNavigation = (category: string, subcategory?: string) => {
    navigate(`/collections?category=${category}${subcategory ? `&subcategory=${subcategory}` : ''}`);
    setIsOpen(false);
    setActiveMenu(null);
    setMobileSubMenu(null);
  };

  const submitSearch = (term: string) => {
    if (term.trim()) {
      navigate(`/collections?search=${encodeURIComponent(term)}`);
      setIsOpen(false);
      setShowSuggestions(false);
      setSearchQuery(''); 
    }
  };

  const handleSearchForm = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  const handleProfileClick = () => {
      if (isAuthenticated) {
          navigate('/profile');
      } else {
          setIsAuthOpen(true);
      }
  };

  // --- Store Locator Scroll Logic ---
  const scrollToStore = () => {
    if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
            document.getElementById('visit-store')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    } else {
        document.getElementById('visit-store')?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false); // Close mobile menu if open
  };

  const openVideoCall = () => {
      window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=I want to book a video consultation.`, '_blank');
  };

  return (
    <>
    <div className="sticky top-0 z-[100] bg-white font-sans shadow-sm" onMouseLeave={() => setActiveMenu(null)}>
      
      {/* 1. TOP NOTIFICATION BANNER */}
      <div className="bg-gradient-to-r from-gray-900 via-brand-black to-gray-900 text-white text-xs py-2 px-4 flex justify-between items-center relative z-50">
         <div className="hidden sm:flex gap-4">
            <span onClick={openVideoCall} className="opacity-90 hover:text-gold-400 cursor-pointer transition-colors">Video Consultation</span>
            <span onClick={scrollToStore} className="opacity-90 hover:text-gold-400 cursor-pointer transition-colors">Store Locator</span>
         </div>
         <div className="flex-1 text-center">
            <span className="font-bold tracking-wide cursor-pointer" onClick={scrollToStore}>Visit our Kalyan West Store for Exclusive Designs</span>
         </div>
         <div className="hidden sm:flex gap-4">
            <span onClick={scrollToStore} className="flex items-center gap-1 cursor-pointer hover:text-gold-400 transition-colors"><MapPin size={12}/> Locate Store</span>
            <a href={`tel:${SHOP_INFO.phone}`} className="flex items-center gap-1 cursor-pointer hover:text-gold-400 transition-colors"><Phone size={12}/> Help</a>
         </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Icons) */}
      <div className="bg-white relative z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Mobile Menu Trigger */}
            <div className="flex items-center md:hidden">
              <button onClick={toggleMenu} className="text-brand-black p-2 -ml-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center transform transition hover:scale-105 duration-300">
              <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                 {/* The Logo Icon */}
                 <div className="w-9 h-9 md:w-12 md:h-12 flex-shrink-0">
                    <SanghaviLogo className="w-full h-full" />
                 </div>
                 
                 {/* The Text Block */}
                 <div className="flex flex-col justify-center">
                    <span className="text-lg md:text-2xl font-serif font-bold text-brand-black tracking-[0.15em] leading-none group-hover:text-gold-700 transition-colors">
                      SANGHAVI
                    </span>
                    <span className="text-[9px] md:text-[11px] text-gold-600 font-bold uppercase tracking-[0.4em] leading-none mt-1">
                      GOLD
                    </span>
                 </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchContainerRef}>
              <div className="relative w-full group">
                  <input 
                    type="text" 
                    placeholder="Search for Gold, Diamond, Silver..." 
                    className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-gray-900 shadow-inner text-sm placeholder-gray-400 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                    onKeyDown={(e) => e.key === 'Enter' && submitSearch(searchQuery)}
                  />
                  <button 
                    onClick={() => submitSearch(searchQuery)}
                    className="absolute right-1 top-1 bottom-1 px-5 bg-brand-black rounded-full text-white hover:bg-gold-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Search size={18} />
                  </button>
                  
                  {/* Desktop Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-50 mt-2 overflow-hidden animate-fade-in-up">
                        <div className="py-2">
                            <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Top Suggestions</p>
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index}
                                    onClick={() => submitSearch(suggestion)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                    <span className="text-sm text-gray-700 group-hover:text-brand-black group-hover:font-medium">
                                        {/* Highlight matching part */}
                                        {suggestion.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                                            part.toLowerCase() === searchQuery.toLowerCase() 
                                            ? <span key={i} className="text-gold-600 font-bold">{part}</span> 
                                            : part
                                        )}
                                    </span>
                                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={handleProfileClick} 
                className="hidden md:flex flex-col items-center cursor-pointer text-brand-black hover:text-gold-600 transition group"
              >
                <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold mt-1 tracking-wide">{isAuthenticated ? 'ACCOUNT' : 'PROFILE'}</span>
              </button>
              
              <Link to="/cart" className="flex flex-col items-center cursor-pointer text-brand-black hover:text-gold-600 transition group relative">
                 <div className="relative">
                     <ShoppingBag size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                     {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-brand-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
                 </div>
                 <span className="text-[10px] font-bold mt-1 tracking-wide hidden md:block">BAG</span>
              </Link>
            </div>
          </div>

          {/* 2.5 MOBILE SEARCH BAR */}
          <div className="md:hidden pb-4">
              <form onSubmit={handleSearchForm} className="relative w-full">
                  <input 
                      type="text" 
                      placeholder="Search for Jewellery..." 
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                  />
                  <Search className="absolute left-3 top-2.5 text-gold-600" size={18} />
                  
                  {/* Suggestions Dropdown Mobile */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-b-lg shadow-xl z-50 mt-1 max-h-[60vh] overflow-y-auto">
                        <div className="py-2">
                             <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Top Matches</p>
                             {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index}
                                    onClick={() => submitSearch(suggestion)}
                                    className="px-4 py-3 border-b border-gray-50 last:border-0 active:bg-gray-50 flex items-center justify-between"
                                >
                                    <span className="text-sm text-gray-800 font-medium">{suggestion}</span>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                             ))}
                        </div>
                    </div>
                  )}
              </form>
          </div>
        </div>
      </div>

      {/* 3. DESKTOP NAVIGATION BAR (Advanced) */}
      <div className="hidden md:block bg-white border-b border-gray-100 shadow-sm relative z-30">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-14 w-full overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-3 lg:gap-6 xl:gap-8 min-w-max mx-auto px-2">
                  {categories.map((item) => (
                      <div 
                          key={item.label}
                          onMouseEnter={() => setActiveMenu(item.label)}
                          className="h-14 flex items-center relative group"
                      >
                          <div 
                              onClick={() => handleNavigation(item.category)}
                              className={`
                                  cursor-pointer 
                                  text-[11px] lg:text-[12px] 
                                  font-bold 
                                  tracking-wide 
                                  transition-all 
                                  duration-200
                                  h-full 
                                  flex 
                                  items-center 
                                  whitespace-nowrap 
                                  uppercase
                                  relative
                                  px-1
                                  ${activeMenu === item.label 
                                      ? 'text-gold-600' 
                                      : 'text-gray-700 hover:text-brand-black'
                                  }
                              `}
                          >
                              {item.label}
                              {/* Hover Indicator Line */}
                              <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-gold-500 transform transition-transform duration-300 origin-left ${activeMenu === item.label ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                          </div>
                      </div>
                  ))}
                </div>
            </div>
        </div>
      </div>

      {/* 4. MEGA MENU DROPDOWN (Advanced) */}
      {activeMenu && (
        <div 
            className="hidden md:block absolute top-full left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-2xl z-20 animate-fade-in-up origin-top"
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
        >
            <div className="max-w-[1400px] mx-auto px-8 py-10">
                <div className="flex gap-16">
                    {/* Columns */}
                    <div className="flex-1 grid grid-cols-4 gap-8">
                      {categories.find(i => i.label === activeMenu)?.sections.map((section, idx) => (
                          <div key={idx} className="space-y-4">
                              <h4 className="text-gold-600 font-bold text-xs uppercase tracking-widest border-b border-gray-100 pb-2">{section.title}</h4>
                              <ul className="space-y-2.5">
                                  {section.items.map(subItem => (
                                      <li key={subItem}>
                                          <span 
                                              onClick={() => handleNavigation(categories.find(i => i.label === activeMenu)!.category, subItem)}
                                              className="text-gray-600 hover:text-brand-black hover:font-bold cursor-pointer text-sm transition-all block hover:translate-x-1 duration-200"
                                          >
                                              {subItem}
                                          </span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                    </div>

                    {/* Featured Image */}
                    <div className="w-72 flex-shrink-0">
                        <div className="w-full h-72 bg-gray-100 rounded-xl overflow-hidden relative group shadow-lg">
                            <img 
                                src={categories.find(i => i.label === activeMenu)?.image} 
                                alt={activeMenu}
                                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                onError={(e) => e.currentTarget.style.display = 'none'} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                                <div>
                                    <span className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1 block">Featured</span>
                                    <h3 className="text-white font-serif text-xl font-bold leading-none">New {activeMenu} Collection</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 5. MOBILE MENU (Smart Nested Navigation) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white overflow-hidden flex flex-col animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white shadow-sm">
                <span className="font-serif font-bold text-xl tracking-wide text-brand-black">
                    {mobileSubMenu ? mobileSubMenu : 'Shop By Category'}
                </span>
                <button onClick={toggleMenu} className="text-gray-800 p-2 hover:bg-gray-100 rounded-full transition">
                    <X size={28} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {mobileSubMenu === null ? (
                    // LEVEL 1: Main Categories (Vertical List - Standard)
                    <div className="flex flex-col pb-20">
                        <div className="grid grid-cols-1 gap-2 p-4 border-b border-gray-100">
                             <button onClick={() => { setIsOpen(false); handleProfileClick(); }} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg w-full">
                                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-black shadow-sm">
                                     <User size={20}/>
                                 </div>
                                 <span className="text-sm font-bold uppercase">{isAuthenticated ? 'My Profile' : 'Login / Signup'}</span>
                             </button>
                             
                             <button onClick={scrollToStore} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg w-full mt-2">
                                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-black shadow-sm">
                                     <MapPin size={20}/>
                                 </div>
                                 <span className="text-sm font-bold uppercase">Store Locator</span>
                             </button>
                        </div>

                        {categories.map((item) => (
                            <button 
                                key={item.label}
                                onClick={() => setMobileSubMenu(item.label)}
                                className="flex justify-between items-center px-6 py-5 border-b border-gray-50 text-left hover:bg-gray-50 active:bg-gray-100 transition group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full p-[2px] border border-gold-200 group-hover:border-gold-500 transition-colors">
                                        <img 
                                            src={item.image} 
                                            alt={item.label} 
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.style.backgroundColor = '#f3f4f6';
                                            }}
                                        />
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm tracking-widest group-hover:text-gold-700 transition-colors">{item.label}</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-gold-500 transition-colors" />
                            </button>
                        ))}
                        
                        {/* ENTERPRISE SECURITY: Removed Admin Login Link from Mobile Menu */}
                        <div className="p-6 space-y-4 mt-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex flex-col gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-2"><Phone size={14}/> {SHOP_INFO.phone}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // LEVEL 2: Subcategories (COMPACT GRID STYLE - Updated)
                    <div className="flex flex-col bg-gray-50 min-h-full pb-20 animate-fade-in-up">
                        <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
                            <button 
                                onClick={() => setMobileSubMenu(null)}
                                className="flex items-center gap-2 px-4 py-4 text-brand-black font-bold text-sm w-full bg-white active:bg-gray-50 transition"
                            >
                                <ChevronLeft size={20} className="text-gold-600" /> 
                                <span className="text-gray-500 font-normal">Back to</span> {mobileSubMenu}
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-6">
                            {categories.find(i => i.label === mobileSubMenu)?.sections.map((section, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gold-500"></div>
                                        {section.title}
                                    </h4>
                                    
                                    {/* GRID LAYOUT - 2 Columns for Compactness */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {section.items.map(subItem => (
                                            <button 
                                                key={subItem}
                                                onClick={() => handleNavigation(categories.find(i => i.label === mobileSubMenu)!.category, subItem)}
                                                className="px-2 py-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-gold-500 hover:text-gold-700 hover:bg-gold-50 active:scale-95 transition-all flex items-center justify-center text-center h-full min-h-[44px] leading-tight break-words"
                                            >
                                                {subItem}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={() => handleNavigation(categories.find(i => i.label === mobileSubMenu)!.category)}
                                className="w-full py-4 bg-brand-black text-white font-bold uppercase text-xs tracking-widest rounded-lg shadow-lg mt-2 flex items-center justify-center gap-2"
                            >
                                View All {mobileSubMenu} <ArrowUpRight size={14}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
    
    <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={() => setIsAuthOpen(false)}
    />
    </>
  );
};

export default Navbar;