import React from 'react';
import { Product } from '../types';
import { MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SHOP_INFO } from '../constants';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUrl = `${window.location.origin}/#/product/${product.id}`;
    const message = `Hi Sanghavi Gold, I saw this product: *${product.name}* (Code: ${product.id}). Link: ${currentUrl}. Can I know the price?`;
    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToBag = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart(product);
      // Optional: Add toast or visual feedback here
      alert("Added to Bag!");
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const isOutOfStock = product.inStock === false;
  
  const displayMode = product.cardDisplayMode || 'price';
  const isPriceOnRequest = product.priceOnRequest === true;
  const hasPrice = product.price && product.price > 0;
  const showPrice = displayMode === 'price' && hasPrice && !isPriceOnRequest;
  const showPriceOnRequest = displayMode === 'price' && isPriceOnRequest;
  const showWeight = displayMode === 'weight' && product.weight && product.weight.trim().length > 0;

  return (
    <div 
      className="bg-white rounded-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group cursor-pointer relative flex flex-col h-full overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-50 flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transform transition duration-700 ${isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNew && !isOutOfStock && (
                <span className="bg-purple-700 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide rounded-[2px] shadow-sm">
                    New
                </span>
            )}
            {isOutOfStock && (
                <span className="bg-gray-800 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide rounded-[2px] shadow-sm">
                    Sold Out
                </span>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-grow min-w-0">
        
        {/* Price Section - Fixed Height for Alignment */}
        <div className="mb-1 min-w-0 h-10 flex flex-col justify-center">
             {showPrice ? (
                 <>
                    <div className="flex flex-wrap items-baseline gap-1 md:gap-2">
                        <span className="text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                            <span className="text-[10px] md:text-xs text-gray-500 line-through whitespace-nowrap">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                    {discount > 0 && (
                        <span className="text-[10px] md:text-xs text-red-600 font-bold block mt-0.5">Flat {discount}% Off</span>
                    )}
                 </>
             ) : showPriceOnRequest ? (
                 <span className="text-xs md:text-sm font-bold text-gold-600 uppercase tracking-wide">Price on Request</span>
             ) : showWeight ? (
               <span className="text-xs md:text-sm font-bold text-gray-700">Weight: {product.weight}</span>
             ) : null}
        </div>

        {/* Product Title - Added break-words and line-clamp handling */}
        <h3 className="text-gray-600 font-sans text-xs md:text-sm leading-snug mb-2 group-hover:text-brand-black transition-colors break-words line-clamp-2" title={product.name}>
            {product.name}
        </h3>

        {/* Actions - Add to Bag Focus */}
        <div className="mt-auto pt-2 flex gap-2">
            <button 
                className={`flex-1 py-2 bg-brand-black text-white text-[10px] md:text-xs font-bold rounded hover:bg-gold-600 transition uppercase flex items-center justify-center gap-1 ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' : ''}`}
                onClick={handleAddToBag}
                disabled={isOutOfStock}
            >
                {isOutOfStock ? 'Sold Out' : <><ShoppingBag size={12} className="md:w-3.5 md:h-3.5" /> Add to Bag</>}
            </button>
            
            <button 
                onClick={handleQuickInquire}
                className="py-2 px-3 border border-gray-200 text-gray-500 rounded hover:border-brand-black hover:text-brand-black transition flex-shrink-0"
            >
                <MessageCircle size={16} />
            </button>
        </div>
      </div>
      
      {/* Ready to Ship Badge Bottom (Hidden on very small mobile to save space) */}
      {!isOutOfStock && (
          <div className="hidden sm:block px-4 pb-3">
              <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> In Store
              </span>
          </div>
      )}
    </div>
  );
};

export default ProductCard;