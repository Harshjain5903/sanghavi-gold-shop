import React from 'react';
import { SHOP_INFO } from '../constants';
import { MapPin, Phone, Mail, Instagram, Facebook, Lock, Twitter, Youtube, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f6f3f9] text-gray-800 pt-16 pb-8 border-t border-gray-200" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: App Download & Social (Optional - simplified for this brand) */}
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Know Your Jewelry */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-brand-black uppercase tracking-wider">Know Your Jewellery</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/collections" className="hover:text-gold-600">DIAMOND GUIDE</Link></li>
              <li><Link to="/collections" className="hover:text-gold-600">JEWELLERY GUIDE</Link></li>
              <li><Link to="/collections" className="hover:text-gold-600">GEMSTONE GUIDE</Link></li>
              <li><Link to="/collections" className="hover:text-gold-600">GOLD RATE</Link></li>
              <li><Link to="/collections" className="hover:text-gold-600">DIGITAL GOLD</Link></li>
            </ul>
          </div>

          {/* Col 2: Advantage */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-brand-black uppercase tracking-wider">Sanghavi Advantage</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/" className="hover:text-gold-600">OLD GOLD EXCHANGE</Link></li>
              <li><Link to="/" className="hover:text-gold-600">VIDEO CONSULTATION</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-brand-black uppercase tracking-wider">Customer Service</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/" className="hover:text-gold-600">RETURN POLICY</Link></li>
              <li><Link to="/" className="hover:text-gold-600">ORDER STATUS</Link></li>
              <li><Link to="/" className="hover:text-gold-600">FAQ</Link></li>
              <li><Link to="/" className="hover:text-gold-600">CONTACT US</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h4 className="text-sm font-bold mb-4 text-brand-black uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                 <Phone size={16} className="text-gold-600 mt-0.5" />
                 <div>
                    <p className="font-bold text-gray-900">{SHOP_INFO.phone}</p>
                    <p>24x7 Customer Support</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <Mail size={16} className="text-gold-600 mt-0.5" />
                 <p>{SHOP_INFO.email}</p>
              </div>
              <div className="flex items-start gap-3">
                 <MapPin size={16} className="text-gold-600 mt-0.5" />
                 <p className="max-w-xs">{SHOP_INFO.address}</p>
              </div>
              
              <div className="flex gap-4 mt-6">
                <a 
                  href={SHOP_INFO.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gold-600 hover:text-white transition"
                  aria-label="Instagram"
                >
                  <Instagram size={14}/>
                </a>
                <a 
                  href={SHOP_INFO.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gold-600 hover:text-white transition"
                  aria-label="Facebook"
                >
                  <Facebook size={14}/>
                </a>
                <a 
                  href={SHOP_INFO.youtube} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gold-600 hover:text-white transition"
                  aria-label="YouTube"
                >
                  <Youtube size={14}/>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           {/* Replaced broken images with a clean text trust badge */}
           <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <ShieldCheck size={16} className="text-gold-600" />
              <span>100% Certified • Hallmarked • Secure</span>
           </div>
           
           <div className="text-xs text-gray-500 text-center md:text-right">
              <p>&copy; 2025 {SHOP_INFO.name}. All rights reserved. <span className="opacity-50">v2.3</span></p>
              <div className="mt-2 space-x-2">
                 <a href="#" className="hover:text-brand-black">Privacy Policy</a>
                 <span>|</span>
                 <a href="#" className="hover:text-brand-black">Terms of Service</a>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;