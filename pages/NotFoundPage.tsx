import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

const NotFoundPage: React.FC = () => {
  usePageTitle('Page not found');
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <p className="text-sm font-bold text-gold-600 uppercase tracking-widest mb-2">404</p>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">We couldn’t find that page</h1>
      <p className="text-gray-500 mb-8">The link may be old, or the item may no longer be available.</p>
      <div className="flex gap-3">
        <Link to="/collections" className="bg-brand-black text-white px-6 py-3 rounded-full font-bold text-sm">Browse jewellery</Link>
        <Link to="/" className="border border-gray-300 px-6 py-3 rounded-full font-bold text-sm">Home</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
