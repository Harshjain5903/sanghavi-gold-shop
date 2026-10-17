import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { SortOptionsProvider } from './context/SortOptionsContext';
import { FilterOptionsProvider } from './context/FilterOptionsContext';
import { RatesProvider } from './context/RatesContext';
import { WishlistProvider } from './context/WishlistContext';

// Old links used "#/" URLs (e.g. /#/product/123, shared on WhatsApp). Turn them into clean URLs.
if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1));
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CategoryProvider>
        <SortOptionsProvider>
          <FilterOptionsProvider>
            <RatesProvider>
              <ProductProvider>
                <WishlistProvider>
                  <CartProvider>
                    <App />
                  </CartProvider>
                </WishlistProvider>
              </ProductProvider>
            </RatesProvider>
          </FilterOptionsProvider>
        </SortOptionsProvider>
      </CategoryProvider>
    </AuthProvider>
  </React.StrictMode>
);