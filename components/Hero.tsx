import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ChevronRight, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { products } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Filter products marked for the New Collection Hero Slider
  const slides = products.filter(p => p.isFeaturedCollection);

  // Auto-slide logic (every 5 seconds)
  useEffect(() => {
    if (slides.length <= 1) return; // Don't slide if 0 or 1 item

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // --- SWIPE HANDLERS ---
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // --- FALLBACK STATIC BANNER (If no products are selected for collection) ---
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-gray-900">
        <img
          className="w-full h-full object-cover opacity-90"
          src="https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&q=80&w=2000"
          alt="Golden Jubilee Collection"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/95 backdrop-blur-md text-brand-black text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg">
                <Sparkles size={10} className="text-gold-600" />
                New Collection
            </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 text-white">
            <div className="max-w-2xl animate-fade-in-up">
                <h1 className="text-3xl md:text-6xl font-serif font-bold mb-2 leading-tight">
                    The Golden Legacy
                </h1>
                <p className="text-gray-200 mb-6 text-sm md:text-lg font-light max-w-lg line-clamp-2">
                    Discover intricate designs crafted for the modern bride.
                </p>
                <Link
                    to="/collections"
                    className="inline-flex items-center gap-2 bg-white text-brand-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-gold-500 hover:text-white transition shadow-lg text-xs md:text-sm rounded-sm"
                >
                    Explore Now <ArrowRight size={16} />
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // --- DYNAMIC CAROUSEL ---
  const currentSlide = slides[currentIndex];

  return (
    // Outer Wrapper - Adds padding on mobile for the "Card" look
    <div className="w-full bg-white pb-2 md:pb-0 pt-3 px-3 md:pt-0 md:px-0">
        <div 
            className="relative w-full h-[420px] md:h-[600px] bg-gray-100 overflow-hidden group cursor-pointer rounded-2xl md:rounded-none shadow-sm md:shadow-none"
            onClick={() => navigate(`/product/${currentSlide.id}`)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
        
        {/* 1. Main Background Image */}
        <div className="absolute inset-0 transition-transform duration-700 ease-in-out bg-gray-200">
            <img
                key={currentSlide.id} 
                src={currentSlide.image}
                alt={currentSlide.name}
                className="w-full h-full object-cover md:object-center object-top animate-fade-in-up" 
                style={{ animationDuration: '0.6s' }}
            />
        </div>

        {/* 2. Premium Gradient Overlay - Softer and more Apple-like */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 pointer-events-none"></div>

        {/* 3. Top Left Badge (Pinned) */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-brand-black text-[9px] md:text-xs font-bold uppercase tracking-widest shadow-md border border-white/20">
                <Sparkles size={10} className="text-gold-600 fill-gold-600" />
                New Collection
            </span>
        </div>

        {/* 4. Bottom Content */}
        <div className="absolute bottom-0 left-0 w-full p-5 md:p-12 z-20 text-white">
            <div className="max-w-3xl animate-fade-in-up">
                
                {/* Product Title */}
                <h2 className="text-2xl md:text-5xl font-serif font-bold mb-1.5 md:mb-3 leading-tight drop-shadow-md break-words tracking-tight">
                    {currentSlide.name}
                </h2>
                
                {/* Price/Weight & CTA Row */}
                <div className="flex items-end justify-between mt-3 md:mt-4">
                  {(currentSlide.cardDisplayMode || 'price') === 'price' ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs text-gray-300 uppercase tracking-wider font-medium mb-0.5">Starting At</span>
                      <span className="text-xl md:text-3xl font-bold text-white tracking-wide">₹{currentSlide.price.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (currentSlide.cardDisplayMode || 'price') === 'weight' && currentSlide.weight ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs text-gray-300 uppercase tracking-wider font-medium mb-0.5">Weight</span>
                      <span className="text-xl md:text-3xl font-bold text-white tracking-wide">{currentSlide.weight}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col"></div>
                  )}
                    
                    <button className="flex items-center gap-2 bg-white text-black px-4 py-2 md:px-8 md:py-3 font-bold uppercase text-[10px] md:text-sm tracking-widest hover:bg-gold-500 hover:text-white transition rounded-full shadow-lg mb-1">
                        Details <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>

        {/* 5. Navigation Arrows (Desktop Only) */}
        {slides.length > 1 && (
            <>
                <button 
                    onClick={prevSlide}
                    className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition z-30 hidden md:flex"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={nextSlide}
                    className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition z-30 hidden md:flex"
                >
                    <ChevronRight size={24} />
                </button>
            </>
        )}

        {/* 6. Dots Indicator (Modern pill style) */}
        {slides.length > 1 && (
            <div className="absolute top-4 right-4 md:bottom-8 md:top-auto md:right-auto md:left-1/2 md:-translate-x-1/2 flex gap-1.5 z-30">
                {slides.map((_, idx) => (
                <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                    className={`transition-all duration-300 rounded-full shadow-sm ${
                    idx === currentIndex 
                        ? 'bg-white w-6 h-1.5 md:w-8 md:h-2' 
                        : 'bg-white/40 w-1.5 h-1.5 md:w-2 md:h-2 hover:bg-white/60'
                    }`}
                />
                ))}
            </div>
        )}

        </div>
    </div>
  );
};

export default Hero;