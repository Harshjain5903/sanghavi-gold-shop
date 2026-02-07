import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Star, Truck, ShieldCheck, RefreshCw, Video, MessageCircle, AlertCircle, ShoppingBag, Scale, Gem, ScrollText, Ruler, Sparkles, ArrowRight } from 'lucide-react';
import VideoCallModal from '../components/VideoCallModal';
import ProductCard from '../components/ProductCard';
import { SHOP_INFO } from '../constants';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Fetch current product
  const product = getProductById(id || '');

  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Image Gallery State
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
      if (product) {
          setSelectedImage(product.image);
      }
  }, [product]);

  // --- RECOMMENDATION ENGINE ---
  const relatedProducts = useMemo(() => {
    if (!product || products.length === 0) return [];

    return products
      .filter(p => {
        // 1. Exclude current product
        if (p.id === product.id) return false;
        
        // 2. Must match at least one Main Category (e.g., "Necklaces")
        const shareCategory = p.category.some(cat => product.category.includes(cat));
        return shareCategory;
      })
      .sort((a, b) => {
        // 3. Logic: Prioritize Exact Subcategory Match (e.g., "Choker" with "Choker")
        const aSubMatch = a.subcategory === product.subcategory ? 1 : 0;
        const bSubMatch = b.subcategory === product.subcategory ? 1 : 0;
        
        if (aSubMatch !== bSubMatch) return bSubMatch - aSubMatch; // Higher score first

        // 4. Logic: Price Proximity (Show items with similar price first)
        const aPriceDiff = Math.abs(a.price - product.price);
        const bPriceDiff = Math.abs(b.price - product.price);
        
        return aPriceDiff - bPriceDiff;
      })
      .slice(0, 8); // Limit to top 8 recommendations
  }, [product, products]);


  if (!product) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <button onClick={() => navigate('/')} className="text-gold-600 underline">Back to Home</button>
        </div>
    );
  }

  // Combine single image and image array for display
  const allImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image];

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setDeliveryDate('Available in your area');
    } else {
      alert('Please enter a valid 6-digit pincode');
    }
  };

  const handleInquire = () => {
    const currentUrl = window.location.href;
    const message = `Hi Sanghavi Gold, I'm interested in this product: *${product.name}* (Code: ${product.id}). \n\nHere is the link: ${currentUrl}\n\nCan you please share the price and details?`;
    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToBag = () => {
      addToCart(product);
      // Redirect to Cart (Buy Now behavior)
      navigate('/cart');
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const isOutOfStock = product.inStock === false;
  
  // Logic: Show price only if > 0 AND "Price on Request" toggle is OFF
  const isPriceOnRequest = product.priceOnRequest === true;
  const hasPrice = product.price && product.price > 0;
  const showPrice = hasPrice && !isPriceOnRequest;

  return (
    <div className="bg-white min-h-screen pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
           Home / {product.category[0]} / <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left: Product Images Gallery */}
          <div className="space-y-4">
             <div className="aspect-square w-full rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shadow-sm relative group">
                <img src={selectedImage || product.image} alt={product.name} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="bg-white text-black px-4 py-2 font-bold uppercase tracking-widest text-lg">Sold Out</span>
                    </div>
                )}
             </div>
             
             {/* Thumbnails */}
             {allImages.length > 1 && (
                 <div className="grid grid-cols-4 gap-4">
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`aspect-square border rounded-md cursor-pointer overflow-hidden transition ${selectedImage === img ? 'border-gold-500 ring-1 ring-gold-500' : 'border-gray-200 hover:border-gray-400'}`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`view ${idx}`} />
                      </div>
                    ))}
                 </div>
             )}
          </div>

          {/* Right: Product Details */}
          <div>
            <div className="border-b pb-6">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex bg-green-700 text-white px-2 py-0.5 rounded text-xs font-bold items-center gap-1">
                  4.9 <Star size={10} fill="currentColor" />
                </div>
                <span className="text-sm text-gray-500 underline cursor-pointer">21 Ratings & Reviews</span>
              </div>

              {showPrice ? (
                  <>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-3xl font-bold text-brand-black">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                            <>
                            <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="text-lg text-red-600 font-bold">({discount}% OFF)</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                  </>
              ) : isPriceOnRequest ? (
                  <div className="bg-gold-50 p-4 rounded-lg inline-block">
                      <span className="text-lg md:text-xl font-bold text-gold-700 uppercase tracking-widest">Price on Request</span>
                  </div>
              ) : (
                  // Empty state - aligns consistently
                  <div className="h-4"></div>
              )}
              
              {isOutOfStock && (
                  <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded flex items-center gap-2">
                      <AlertCircle size={16} />
                      This item is currently out of stock.
                  </div>
              )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:grid grid-cols-2 gap-4 py-6">
               {showPrice ? (
                   <button 
                    onClick={handleAddToBag}
                    disabled={isOutOfStock}
                    className={`flex flex-col items-center justify-center p-4 bg-brand-black text-white rounded-lg hover:bg-gold-600 transition shadow-lg ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
                    >
                    <span className="flex items-center gap-2 font-bold uppercase text-lg"><ShoppingBag size={20} /> Add to Bag</span>
                    </button>
               ) : (
                   <button 
                    onClick={handleInquire}
                    className="flex flex-col items-center justify-center p-4 bg-brand-black text-white rounded-lg hover:bg-gold-600 transition shadow-lg"
                    >
                    <span className="flex items-center gap-2 font-bold uppercase text-lg"><MessageCircle size={20} /> {isPriceOnRequest ? 'Contact for Price' : 'Inquire'}</span>
                    </button>
               )}
               
               <button 
                 onClick={handleInquire}
                 className="flex flex-col items-center justify-center p-3 border-2 border-brand-black text-brand-black rounded-lg hover:bg-gray-50 transition"
               >
                 <span className="flex items-center gap-2 font-bold uppercase text-sm"><MessageCircle size={18} /> Chat on WhatsApp</span>
                 <span className="text-[10px] opacity-70 mt-1">Get instant response</span>
               </button>
            </div>

            {/* Video Call Button - OPTIMIZED FOR MOBILE */}
            <div className="my-6 md:my-0">
                <button 
                    onClick={() => setIsVideoModalOpen(true)} 
                    className="w-full md:w-auto py-3 px-6 rounded-lg border-2 border-gold-400 bg-gold-50 text-gold-800 font-bold flex items-center justify-center gap-2 hover:bg-gold-100 transition shadow-sm text-sm uppercase tracking-wider"
                >
                    <Video size={18} /> Request Video Call
                </button>
            </div>

            {/* Delivery Checker */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 mt-6">
               <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Truck size={16} /> Availability Check</h4>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Enter Pincode" 
                   value={pincode}
                   onChange={(e) => setPincode(e.target.value)}
                   className="border rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-brand-black"
                   maxLength={6}
                 />
                 <button onClick={handlePincodeCheck} className="text-sm font-bold text-brand-black underline">Check</button>
               </div>
               {deliveryDate && <p className="text-green-700 text-xs font-bold mt-2">{deliveryDate}</p>}
            </div>

            {/* --- PREMIUM SPECIFICATIONS CARD --- */}
            <div className="mt-8 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b border-gray-100">
                    <h3 className="font-serif font-bold text-lg text-gray-900">Product Details</h3>
                </div>
                
                <div className="p-6">
                    {/* Grid for Technical Specs */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-6">
                        {(product.specifications || []).filter(s => s.value).map((spec, idx) => (
                            <div key={idx} className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    {/* Smart Icon Mapping based on key name */}
                                    {spec.key.includes('Weight') ? <Scale size={12}/> : 
                                     spec.key.includes('Purity') ? <Sparkles size={12}/> :
                                     spec.key.includes('Cert') ? <ScrollText size={12}/> :
                                     spec.key.includes('Dimension') ? <Ruler size={12}/> :
                                     spec.key.includes('Material') ? <Gem size={12}/> :
                                     <div className="w-1 h-1 bg-gold-400 rounded-full"></div>
                                    }
                                    {spec.key}
                                </span>
                                <span className="text-sm font-bold text-gray-900">{spec.value}</span>
                            </div>
                        ))}
                        
                        {/* Fallback Legacy Specs if array is empty */}
                        {(!product.specifications || product.specifications.length === 0) && (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Gem size={12}/> Material</span>
                                    <span className="text-sm font-bold text-gray-900">Gold</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Sparkles size={12}/> Purity</span>
                                    <span className="text-sm font-bold text-gray-900">{product.purity || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Scale size={12}/> Gross Weight</span>
                                    <span className="text-sm font-bold text-gray-900">{product.weight || '-'}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Description Section */}
                    {product.description && (
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t">
               <div className="text-center">
                 <div className="bg-gold-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-gold-600">
                    <ShieldCheck size={20} />
                 </div>
                 <p className="text-[10px] font-bold">100% Certified</p>
               </div>
               <div className="text-center">
                 <div className="bg-gold-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-gold-600">
                    <RefreshCw size={20} />
                 </div>
                 <p className="text-[10px] font-bold">Lifetime Exchange</p>
               </div>
               <div className="text-center">
                 <div className="bg-gold-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-gold-600">
                    <Truck size={20} />
                 </div>
                 <p className="text-[10px] font-bold">Insured Shipping</p>
               </div>
            </div>

          </div>
        </div>
        
        {/* --- RELATED PRODUCTS SECTION (AMAZON STYLE) --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-24 border-t border-gray-100 pt-10">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h2 className="text-xl md:text-3xl font-serif font-bold text-brand-black">You May Also Like</h2>
                  <p className="text-gray-500 text-sm mt-1">Handpicked designs similar to {product.name}</p>
               </div>
               <button 
                onClick={() => navigate('/collections')} 
                className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-brand-black pb-1 hover:text-gold-600 hover:border-gold-600 transition"
               >
                 View More <ArrowRight size={16} />
               </button>
            </div>
            
            {/* Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
                {relatedProducts.map(relatedProduct => (
                    <div key={relatedProduct.id} className="min-w-[180px] md:min-w-0 snap-center mr-4 md:mr-0">
                        <ProductCard product={relatedProduct} />
                    </div>
                ))}
            </div>
            
             <button 
                onClick={() => navigate('/collections')} 
                className="md:hidden mt-2 w-full py-3 border border-gray-200 text-gray-800 font-bold text-sm rounded-lg"
               >
                 View All Jewellery
             </button>
          </div>
        )}

      </div>
      
      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex gap-3">
          {showPrice ? (
              <button 
                onClick={handleAddToBag}
                disabled={isOutOfStock}
                className={`flex-1 py-3 bg-brand-black text-white font-bold uppercase rounded shadow-lg flex items-center justify-center gap-2 text-sm ${isOutOfStock ? 'opacity-50 bg-gray-500' : ''}`}
                >
                <ShoppingBag size={18} /> {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </button>
          ) : (
              <button 
                onClick={handleInquire}
                className={`flex-1 py-3 bg-brand-black text-white font-bold uppercase rounded shadow-lg flex items-center justify-center gap-2 text-sm`}
                >
                <MessageCircle size={18} /> {isPriceOnRequest ? 'Contact for Price' : 'Inquire'}
                </button>
          )}
          <button 
             onClick={handleInquire}
             className="flex-1 py-3 border border-brand-black text-brand-black font-bold uppercase rounded flex items-center justify-center gap-2 text-sm"
          >
             <MessageCircle size={18} /> Inquire
          </button>
      </div>

      <VideoCallModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} productName={product.name} />
    </div>
  );
};

export default ProductDetailsPage;