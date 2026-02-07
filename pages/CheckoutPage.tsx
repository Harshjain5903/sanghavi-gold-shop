import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Video, Phone, MapPin, Instagram, Facebook, Youtube, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRates } from '../context/RatesContext';
import { SHOP_INFO } from '../constants';

const CheckoutPage: React.FC = () => {
  const { items, cartTotal } = useCart();
  const { rates } = useRates();
  const navigate = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
      if(items.length === 0) {
          navigate('/collections');
      }
  }, [items, navigate]);

  if (items.length === 0) return null;

  const hasRates = rates.gold22k > 0 || rates.gold24k > 0 || rates.gold18k > 0 || rates.silver > 0;
  const formatByUnit = (value: number, unit: '1g' | '10g' | '100g' | '1kg') => {
    if (!value || value <= 0) return '--';
    const multiplier = unit === '10g' ? 10 : unit === '100g' ? 100 : unit === '1kg' ? 1000 : 1;
    const label = unit === '1kg' ? 'kg' : unit;
    return `₹${(value * multiplier).toLocaleString('en-IN')}/${label}`;
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

  const buildInquiryMessage = (action: 'inquiry' | 'video') => {
    const targetItems = items;
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
      if (item.weight) message += `   Weight: ${item.weight}\n`;
      if (item.purity) message += `   Purity: ${item.purity}\n`;
      message += `   Link: ${itemUrl}\n\n`;
    });

    const totalVal = targetItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    if (totalVal > 0) {
      message += `Total Selected Value (priced items): ₹${totalVal.toLocaleString('en-IN')}\n\n`;
    } else {
      message += 'Total Selected Value: Price on request\n\n';
    }

    if (action === 'video') {
      message += 'Please let me know when we can connect for a live viewing.';
    } else {
      message += 'Can you please confirm availability?';
    }

    return message;
  };

  const openWhatsApp = (action: 'inquiry' | 'video') => {
    const message = buildInquiryMessage(action);
    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const pricedItemCount = items.reduce((count, item) => count + (isPricedItem(item) ? item.quantity : 0), 0);
  const unpricedItemCount = items.reduce((count, item) => count + (!isPricedItem(item) ? item.quantity : 0), 0);
  const hasUnpricedItems = unpricedItemCount > 0;

  const mapUrl = 'https://www.google.com/maps/place/SANGHAVI+GOLD+KALYAN/@19.2387693,73.1289198,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7958fd45a3135:0xae4bd5a000116613!8m2!3d19.2387693!4d73.1314947!16s%2Fg%2F11v6k8vs4v?entry=ttu&g_ep=EgoyMDI2MDIwNC4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D';

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold-50 text-gold-700 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Checkout</p>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-black">Online ordering is coming soon</h1>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              For now, the website is for browsing designs, comparing categories, and inquiring with our team.
              Use the quick actions below to confirm availability, request a live video call, or visit the store.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => openWhatsApp('inquiry')}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition"
              >
                <MessageCircle size={18} /> Inquire on WhatsApp
              </button>
              <button
                onClick={() => openWhatsApp('video')}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-brand-black text-brand-black hover:bg-brand-black hover:text-white transition"
              >
                <Video size={18} /> Request Video Call
              </button>
              <a
                href={`tel:${SHOP_INFO.phone.replace(/\s/g, '')}`}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                <Phone size={18} /> Call Us
              </a>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                <MapPin size={18} /> Visit Store
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="font-bold uppercase tracking-wider">Follow</span>
              <a href={SHOP_INFO.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold-600">
                <Instagram size={14} /> Instagram
              </a>
              <a href={SHOP_INFO.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold-600">
                <Facebook size={14} /> Facebook
              </a>
              <a href={SHOP_INFO.youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold-600">
                <Youtube size={14} /> YouTube
              </a>
            </div>
          </div>

          {hasRates && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Live Rates</h3>
                {rates.updatedAt && (
                  <span className="text-[10px] text-gray-400">Updated {new Date(rates.updatedAt).toLocaleString('en-IN')}</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Gold 22kt</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatByUnit(rates.gold22k, rates.goldDisplayUnit || '10g')}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Gold 24kt</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatByUnit(rates.gold24k, rates.goldDisplayUnit || '10g')}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Silver</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatByUnit(rates.silver, rates.silverDisplayUnit || '1kg')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Order Summary</h3>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold line-clamp-2 text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold mt-1">{getItemPriceLabel(item)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal (priced items{pricedItemCount > 0 ? `: ${pricedItemCount}` : ''})</span>
                <span className="font-bold">{pricedItemCount > 0 ? `₹${cartTotal.toLocaleString('en-IN')}` : 'Price on request'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                <span>Total</span>
                <span>{pricedItemCount > 0 ? `₹${cartTotal.toLocaleString('en-IN')}` : 'Price on request'}</span>
              </div>
            </div>
            {hasUnpricedItems && (
              <p className="mt-3 text-[11px] text-gray-500">
                {unpricedItemCount} item{unpricedItemCount > 1 ? 's' : ''} priced on request. Final value will be confirmed on WhatsApp.
              </p>
            )}

            <button
              onClick={() => navigate('/collections')}
              className="w-full mt-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              Continue Shopping
            </button>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg">
              <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
              <p>100% certified, hallmarked jewellery. Secure inquiries and trusted assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;