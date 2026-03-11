import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShieldCheck, ShoppingBag, Video, MessageCircle, Square, CheckSquare, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SHOP_INFO } from '../constants';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Select all items by default on load
  useEffect(() => {
    if (items.length > 0) {
      setSelectedIds(items.map(i => i.id));
    }
  }, [items]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  // If bag is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 animate-fade-in-up">
        <div className="w-40 h-40 bg-purple-50 rounded-full flex items-center justify-center mb-6">
           <ShoppingBag size={60} className="text-purple-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brand-black mb-2">Oops! Your bag is empty!</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Let's shop some jewels and fill it with happiness.</p>
        <button 
          onClick={() => navigate('/collections')} 
          className="bg-brand-black text-white px-10 py-3.5 rounded-full font-bold hover:bg-gold-600 transition shadow-lg uppercase tracking-wide text-sm"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const isPricedItem = (item: (typeof items)[number]) => {
    const displayMode = item.cardDisplayMode || 'price';
    const isPriceOnRequest = item.priceOnRequest === true;
    const hasPrice = item.price && item.price > 0;
    return displayMode === 'price' && hasPrice && !isPriceOnRequest;
  };

  const getItemPriceLabel = (item: (typeof items)[number]) => {
    const displayMode = item.cardDisplayMode || 'price';
    const isPriceOnRequest = item.priceOnRequest === true;
    const hasPrice = item.price && item.price > 0;
    const showWeight = displayMode === 'weight' && item.weight && item.weight.trim().length > 0;

    if (displayMode === 'price' && hasPrice && !isPriceOnRequest) {
      return `₹${item.price.toLocaleString('en-IN')}`;
    }
    if (showWeight) {
      return `Wt: ${item.weight}`;
    }
    return 'Price on request';
  };

  const pricedItemCount = items.reduce((count, item) => count + (isPricedItem(item) ? item.quantity : 0), 0);
  const unpricedItemCount = items.reduce((count, item) => count + (!isPricedItem(item) ? item.quantity : 0), 0);
  const hasUnpricedItems = unpricedItemCount > 0;

  // Generate WhatsApp Message
  const generateMessage = (action: 'inquiry' | 'video') => {
    const targetIds = selectedIds.length > 0 ? selectedIds : items.map(i => i.id); // Default to all if none selected, or strict selection
    const targetItems = items.filter(i => targetIds.includes(i.id));

    if (targetItems.length === 0) {
        alert("Please select at least one item.");
        return;
    }

    let message = `Hi Sanghavi Gold, I would like to ${action === 'video' ? 'request a VIDEO CALL' : 'INQUIRE'} about the following items from my bag:\n\n`;
    
    targetItems.forEach((item, index) => {
        const itemUrl = `${window.location.origin}/#/product/${item.id}`;
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Code: ${item.id}\n`;
        message += `   Qty: ${item.quantity}\n`;
        if (isPricedItem(item)) {
          message += `   Price: ₹${item.price.toLocaleString('en-IN')}\n`;
        } else {
          message += '   Price: On request\n';
        }
        if(item.weight) message += `   Weight: ${item.weight}\n`;
        if(item.purity) message += `   Purity: ${item.purity}\n`;
        message += `   Link: ${itemUrl}\n\n`;
    });

      const totalVal = targetItems.reduce((acc, curr) => acc + (isPricedItem(curr) ? (curr.price * curr.quantity) : 0), 0);
      if (totalVal > 0) {
        message += `Total Selected Value (priced items): ₹${totalVal.toLocaleString('en-IN')}\n\n`;
      } else {
        message += 'Total Selected Value: Price on request\n\n';
      }
    
    if (action === 'video') {
        message += "Please let me know when we can connect for a live viewing.";
    } else {
        message += "Can you please confirm availability?";
    }

    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const activeSelectionCount = selectedIds.length;
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            Shopping Bag <span className="text-sm font-sans text-gray-500 font-normal">({cartCount} Items)</span>
            </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left: Cart Items */}
           <div className="lg:col-span-2 space-y-4">
             
             {/* Select All Header */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <button onClick={toggleSelectAll} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    {isAllSelected ? <CheckSquare className="text-gold-600" /> : <Square className="text-gray-300" />}
                    Select All Items
                </button>
             </div>

             {items.map(item => {
               const isSelected = selectedIds.includes(item.id);
               const meta = [item.weight, item.purity].filter(Boolean).join(' | ');
               return (
                <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm flex gap-4 items-start md:items-center relative transition-all ${isSelected ? 'border-2 border-gold-400 bg-gold-50/10' : 'border border-transparent'}`}>
                    
                    {/* Checkbox */}
                    <button onClick={() => toggleSelection(item.id)} className="mt-1 md:mt-0 flex-shrink-0">
                        {isSelected ? <CheckSquare className="text-gold-600" /> : <Square className="text-gray-300" />}
                    </button>

                    <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-bold text-gray-900 text-base md:text-lg pr-4 leading-tight line-clamp-2">{item.name}</h3>
                                {meta && <p className="text-xs text-gray-500 mb-2 mt-1">{meta}</p>}
                             </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 gap-3">
                            {/* Price Block */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg">{getItemPriceLabel(item)}</p>
                                    {item.originalPrice && <p className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</p>}
                                </div>
                                <p className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Stock
                                </p>
                            </div>

                            {/* Quantity Control (Updated High Contrast) */}
                            <div className="flex items-center border border-gray-300 rounded-lg h-9 bg-white shadow-sm overflow-hidden">
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-l-lg disabled:opacity-30 disabled:cursor-not-allowed transition border-r border-gray-200"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-10 h-full flex items-center justify-center font-bold text-sm text-gray-900 bg-white">
                                    {item.quantity}
                                </span>
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-r-lg transition border-l border-gray-200"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
               );
             })}

             {/* ADD MORE PRODUCTS BUTTON (Minimalistic) */}
             <button 
                onClick={() => navigate('/collections')}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-gold-500 hover:text-gold-600 hover:bg-gold-50 transition flex items-center justify-center gap-2 group"
             >
                <div className="p-1 bg-gray-200 rounded-full group-hover:bg-gold-200 transition text-gray-600 group-hover:text-gold-700">
                    <Plus size={20} />
                </div>
                <span>Add More Products</span>
             </button>

             {/* Security Note */}
             <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm text-xs text-gray-500 border border-gray-100">
                 <ShieldCheck size={20} className="text-green-600 flex-shrink-0" />
                 <p>All items are 100% Hallmarked and come with an authentic certificate. Safe and Insured Delivery.</p>
             </div>
           </div>

           {/* Right: Summary & Actions */}
           <div className="h-fit space-y-4">
              
              {/* WhatsApp Actions (Inquire / Video) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <p className="text-xs text-gray-500 mb-4">
                      {activeSelectionCount > 0 
                        ? `Perform action on ${activeSelectionCount} selected items.` 
                        : "Select items to perform actions."}
                  </p>
                  
                  <div className="space-y-3">
                      <button 
                          onClick={() => generateMessage('inquiry')}
                          disabled={activeSelectionCount === 0}
                          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition ${activeSelectionCount > 0 ? 'border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                      >
                          <MessageCircle size={18} /> Inquire Availability
                      </button>

                      <button 
                          onClick={() => generateMessage('video')}
                          disabled={activeSelectionCount === 0}
                          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition ${activeSelectionCount > 0 ? 'border-brand-black text-brand-black hover:bg-brand-black hover:text-white' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                      >
                          <Video size={18} /> Request Video Call
                      </button>
                  </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h3>
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal (priced items{pricedItemCount > 0 ? `: ${pricedItemCount}` : ''})</span>
                        <span className="font-bold text-gray-900">{pricedItemCount > 0 ? `₹${cartTotal.toLocaleString('en-IN')}` : 'Price on request'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Discount</span>
                        <span className="text-green-600">- ₹0</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                      <span className="font-bold">To be confirmed</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold text-brand-black">
                        <span>Total</span>
                        <span>{pricedItemCount > 0 ? `₹${cartTotal.toLocaleString('en-IN')}` : 'Price on request'}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-right">(Inclusive of all taxes)</p>
                  </div>
                  {hasUnpricedItems && (
                    <p className="text-[11px] text-gray-500 -mt-2">
                      {unpricedItemCount} item{unpricedItemCount > 1 ? 's' : ''} priced on request. Final value will be confirmed on WhatsApp.
                    </p>
                  )}

                  <button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-gradient-to-r from-brand-black to-gray-800 text-white py-4 rounded-lg font-bold hover:shadow-lg hover:to-black transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>
                  <p className="text-[11px] text-gray-500 mt-2">
                    Online ordering is coming soon. Next step shows inquiry options.
                  </p>

                  <button 
                    onClick={() => navigate('/collections')}
                    className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                  >
                    Continue Shopping
                  </button>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default CartPage;