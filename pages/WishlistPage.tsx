import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, Trash2, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { priceLabel } from '../lib/pricing';
import { itemsMessage, openWhatsApp } from '../lib/whatsapp';
import { usePageTitle } from '../lib/usePageTitle';

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  usePageTitle('My Wishlist');

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 animate-fade-in-up">
        <div className="w-40 h-40 bg-pink-50 rounded-full flex items-center justify-center mb-6">
           <Heart size={60} className="text-pink-300 fill-pink-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brand-black mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Save items you love here to check them out later.</p>
        <button 
          onClick={() => navigate('/collections')} 
          className="bg-brand-black text-white px-10 py-3.5 rounded-full font-bold hover:bg-gold-600 transition shadow-lg uppercase tracking-wide text-sm"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const handleShareWishlist = () => openWhatsApp(itemsMessage(wishlist, 'inquiry', 'wishlist'));

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
           <h1 className="text-2xl font-serif font-bold text-gray-900">
             My Wishlist <span className="text-base font-sans font-normal text-gray-500">({wishlist.length} Items)</span>
           </h1>
           <button 
             onClick={handleShareWishlist}
             className="bg-[#25D366] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#20bd5a] transition flex items-center gap-2 shadow-sm text-sm"
           >
             <MessageCircle size={18} /> Send List to Shop
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group">
               <div className="relative aspect-square bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
               <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1 mb-4">
                     <span className="font-bold">{priceLabel(product)}</span>
                  </div>
                  <button 
                    onClick={() => { addToCart(product); removeFromWishlist(product.id); }}
                    className="w-full py-2 border border-brand-black text-brand-black font-bold text-xs uppercase rounded hover:bg-brand-black hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} /> Move to Bag
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;