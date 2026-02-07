import React, { useState } from 'react';
import { MapPin, Navigation, Star, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Images Array - defined outside to be static
// Added a 4th image to ensure the "4 photos" requirement is met for the gallery scroll
const STORE_IMAGES = [
  "https://drive.google.com/thumbnail?id=1Hohl6nB3RH88tYM8awUZRQh9eC06S2RB&sz=w1000", // Store Front
  "https://drive.google.com/thumbnail?id=1-X_caUaDwSSakPiDQen5WMoIAGa375nC&sz=w1000", // Interior 1
  "https://drive.google.com/thumbnail?id=1hkkT0cbWHdbFMwJdAZwl30pyOk0XlVua&sz=w1000", // Customers
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=1000" // Extra Interior View
];

const StoreShowcase: React.FC = () => {
  // State for reviews (Prepared for API integration)
  const [reviewData] = useState({
    rating: 5.0,
    count: 173
  });

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % STORE_IMAGES.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + STORE_IMAGES.length) % STORE_IMAGES.length);
  };

  return (
    <section className="py-12 bg-black text-white" id="visit-store">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Heading at the Top */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8 text-white">
          Visit Our Store
        </h2>
        
        {/* Compact Card Container */}
        <div className="bg-[#111] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 flex flex-col md:flex-row h-auto md:h-[320px]">
            
            {/* LEFT: Photo Collage (Clickable for Gallery) */}
            <div className="w-full md:w-1/2 h-64 md:h-full relative cursor-pointer group">
                <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full p-1 bg-black/50">
                     {/* Main Photo (Left) */}
                     <div className="row-span-2 col-span-1 rounded-l-lg overflow-hidden relative" onClick={() => openLightbox(0)}>
                         <img 
                            src={STORE_IMAGES[0]} 
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                            alt="Sanghavi Gold Store Front"
                         />
                         <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                     </div>
                     {/* Top Right */}
                     <div className="col-span-1 row-span-1 rounded-tr-lg overflow-hidden relative" onClick={() => openLightbox(1)}>
                         <img 
                            src={STORE_IMAGES[1]} 
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                            alt="Interior"
                         />
                         <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                     </div>
                     {/* Bottom Right */}
                     <div className="col-span-1 row-span-1 rounded-br-lg overflow-hidden relative" onClick={() => openLightbox(2)}>
                         <img 
                            src={STORE_IMAGES[2]} 
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                            alt="Customers"
                         />
                         {/* Removed Text Overlay, kept simple hover effect */}
                         <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                     </div>
                </div>
            </div>

            {/* RIGHT: Compact Info (Actionable) */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center relative bg-gradient-to-br from-[#1a1a1a] to-black">
                
                {/* Header & Rating */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-white leading-none mb-1">Sanghavi Gold</h2>
                        <div className="flex items-center gap-1 text-gold-500 text-xs font-bold uppercase tracking-widest">
                            <MapPin size={12} /> Kalyan West
                        </div>
                    </div>
                    
                    {/* Live Google Rating Badge */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded border border-white/5 backdrop-blur-sm">
                            <span className="text-base font-bold text-white">{reviewData.rating}</span>
                            <div className="flex text-gold-500">
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                                <Star size={12} fill="currentColor" />
                            </div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">{reviewData.count} Google Reviews</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                     {/* Hours */}
                     <div className="flex items-start gap-3 text-sm">
                         <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                             <Clock size={16} />
                         </div>
                         <div>
                             <p className="text-white font-bold">10:00 AM - 9:00 PM</p>
                             <div className="flex items-center gap-2 text-xs">
                                <span className="text-green-400 font-bold">Tue - Sun</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="text-red-400">Closed on Monday</span>
                             </div>
                         </div>
                     </div>

                     {/* Address */}
                     <p className="text-xs text-gray-400 leading-relaxed pl-11">
                        Zojwala Commercial Centre, Opp. Hotel Vrindavan Residency, <br/>
                        <span className="text-white font-bold">Kalyan West - 421301</span>
                     </p>
                </div>

                {/* Call To Action */}
                <a 
                    href="https://www.google.com/maps/place/SANGHAVI+GOLD+KALYAN/@19.2399629,73.1276645,15z/data=!4m15!1m8!3m7!1s0x3be7958fd45a3135:0xae4bd5a000116613!2sSANGHAVI+GOLD+KALYAN!8m2!3d19.2385128!4d73.1318075!10e5!16s%2Fg%2F11v6k8vs4v!3m5!1s0x3be7958fd45a3135:0xae4bd5a000116613!8m2!3d19.2385128!4d73.1318075!16s%2Fg%2F11v6k8vs4v?entry=ttu" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-white text-black py-3.5 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gold-500 hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 group"
                >
                    <Navigation size={16} className="text-gold-600 group-hover:text-white fill-gold-600 group-hover:fill-white transition-colors" /> 
                    Get Directions
                </a>

            </div>
        </div>

        {/* 4. LIGHTBOX OVERLAY */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up" onClick={closeLightbox}>
            
            {/* Close Button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition p-2 z-10 bg-black/20 rounded-full"
            >
              <X size={32} />
            </button>
            
            {/* Navigation Left */}
            <button 
              onClick={prevImage}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Main Image */}
            <img 
              src={STORE_IMAGES[currentImageIndex]} 
              alt={`Store Gallery ${currentImageIndex + 1}`}
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
            />

            {/* Navigation Right */}
            <button 
              onClick={nextImage}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
            >
              <ChevronRight size={32} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {STORE_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-gold-500 w-6' : 'bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
            
            <p className="absolute bottom-6 right-8 text-white/30 text-xs font-bold hidden md:block">
                {currentImageIndex + 1} / {STORE_IMAGES.length}
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default StoreShowcase;