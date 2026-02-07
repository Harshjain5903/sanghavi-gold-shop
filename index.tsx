import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CategoryProvider>
        <ProductProvider>
            <CartProvider>
              <App />
            </CartProvider>
        </ProductProvider>
      </CategoryProvider>
    </AuthProvider>
  </React.StrictMode>
);