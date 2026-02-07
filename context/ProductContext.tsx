import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Firebase Realtime Database (Firestore)
  useEffect(() => {
    // We listen to the collection in real-time
    const unsubscribe = onSnapshot(
      collection(db, 'products'), 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // SANITIZATION: Ensure category is always an array to prevent app crashes
          let safeCategory: string[] = [];
          if (Array.isArray(data.category)) {
            safeCategory = data.category;
          } else if (typeof data.category === 'string') {
            safeCategory = [data.category];
          }

          return {
            id: doc.id,
            ...data,
            category: safeCategory
          };
        }) as Product[];
        
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        // --- ERROR HANDLING FOR WRONG RULES ---
        console.error("Firebase Database Error:", error);
        if (error.code === 'permission-denied') {
          alert("⛔ FIREBASE ERROR: Permission Denied.\n\nYou pasted the WRONG rules in the Firestore Database section.\n\nPlease go to Firebase Console > Firestore Database > Rules.\nDelete the code there and paste the code starting with 'service cloud.firestore'.\n\n(See the chat for the correct code!)");
        } else {
          console.log("Database connection issue. Ensure you are online.");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Product) => {
    const { id, ...data } = product; // Remove empty ID, let firebase generate it
    await addDoc(collection(db, 'products'), data);
  };

  const updateProduct = async (updatedProduct: Product) => {
    const productRef = doc(db, 'products', updatedProduct.id);
    await updateDoc(productRef, { ...updatedProduct });
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};