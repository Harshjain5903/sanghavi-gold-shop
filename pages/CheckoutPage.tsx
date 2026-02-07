import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Smartphone, CreditCard, Banknote, Check, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [mobile, setMobile] = useState('');

  // Auto-fill data if user is logged in
  useEffect(() => {
    if (user) {
        // Split name if possible
        const names = user.name.split(' ');
        setFirstName(names[0]);
        setMobile(user.mobile);
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
      if(items.length === 0) {
          navigate('/collections');
      }
  }, [items, navigate]);

  if (items.length === 0) return null;

  const handlePlaceOrder = () => {
    // Simulate order placement
    alert('Order Placed Successfully! Thank you for shopping with Sanghavi Gold.');
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logged In Info (If Auth) */}
          {isAuthenticated && step === 1 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gold-200 bg-gold-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full text-gold-600"><User size={20}/></div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">Logged in as</p>
                          <p className="text-sm font-bold text-gray-900">{user?.mobile || 'Guest'}</p>
                      </div>
                  </div>
              </div>
          )}
          
          {/* Step 1: Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > 1 ? 'bg-green-600 text-white' : 'bg-brand-black text-white'}`}>
                   {step > 1 ? <Check size={14} /> : '1'}
                 </span>
                 Shipping Address
               </h3>
               {step > 1 && <button onClick={() => setStep(1)} className="text-xs text-gold-600 underline">Edit</button>}
             </div>
             
             {step === 1 ? (
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="First Name" 
                        required 
                        className="border p-3 rounded-lg w-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-black outline-none transition" 
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <input type="text" placeholder="Last Name" required className="border p-3 rounded-lg w-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-black outline-none transition" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number" 
                    required 
                    className="border p-3 rounded-lg w-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-black outline-none transition" 
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                  />
                  <input type="text" placeholder="Pincode" required className="border p-3 rounded-lg w-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-black outline-none transition" />
                  <textarea placeholder="Full Address (House No, Building, Street)" required className="border p-3 rounded-lg w-full h-24 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-black outline-none transition"></textarea>
                  <input type="text" placeholder="City / District" required className="border p-3 rounded-lg w-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-black outline-none transition" />
                  
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-brand-black text-white py-3.5 rounded-lg font-bold hover:bg-gold-600 transition shadow-md uppercase tracking-wide text-sm">
                        Continue to Payment
                    </button>
                  </div>
                </form>
             ) : (
                <div className="text-sm text-gray-600 pl-8">
                  <p className="font-bold text-gray-900">{firstName} (Default)</p>
                  <p>123, Gold Street, Zojwala Complex, Kalyan West - 421301</p>
                  <p>+91 {mobile}</p>
                </div>
             )}
          </div>

          {/* Step 2: Payment */}
          <div className={`bg-white p-6 rounded-lg shadow-sm ${step === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
             <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                 <span className="w-6 h-6 rounded-full bg-brand-black text-white flex items-center justify-center text-xs">2</span>
                 Payment Method
             </h3>

             {step === 2 && (
               <div className="space-y-4 animate-fade-in-up">
                  {/* UPI */}
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'upi' ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-brand-black w-4 h-4" />
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-full text-green-600"><Smartphone size={20} /></div>
                         <div>
                            <span className="font-bold text-gray-900 block">UPI</span>
                            <span className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                         </div>
                      </div>
                    </div>
                  </label>

                  {/* Card */}
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'card' ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-brand-black w-4 h-4" />
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-full text-blue-600"><CreditCard size={20} /></div>
                         <span className="font-bold text-gray-900">Credit / Debit Card</span>
                      </div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-brand-black w-4 h-4" />
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-full text-orange-600"><Banknote size={20} /></div>
                         <span className="font-bold text-gray-900">Cash on Delivery</span>
                      </div>
                    </div>
                  </label>

                  <button onClick={handlePlaceOrder} className="w-full bg-gradient-to-r from-brand-black to-gray-900 text-white py-4 rounded-lg font-bold text-lg hover:to-black transition shadow-lg mt-6 uppercase tracking-wide">
                    Place Order (₹{cartTotal.toLocaleString('en-IN')})
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
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
                        <p className="text-sm font-bold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Subtotal</span>
                   <span className="font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Shipping</span>
                   <span className="text-green-600 font-bold">FREE</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                   <span>Total</span>
                   <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                 </div>
              </div>
              
              <div className="mt-6 flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg">
                 <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
                 <p>Safe and Secure Payments. 100% Authentic Products. Hallmarked Jewellery.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;