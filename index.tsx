import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { SortOptionsProvider } from './context/SortOptionsContext';
import { FilterOptionsProvider } from './context/FilterOptionsContext';
import { RatesProvider } from './context/RatesContext';

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
                  <CartProvider>
                    <App />
                  </CartProvider>
              </ProductProvider>
            </RatesProvider>
          </FilterOptionsProvider>
        </SortOptionsProvider>
      </CategoryProvider>
    </AuthProvider>
  </React.StrictMode>
);