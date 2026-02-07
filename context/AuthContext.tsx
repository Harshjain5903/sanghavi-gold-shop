import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  uid?: string;
  name: string;
  mobile: string;
  email: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch extra profile details from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
             setUser({ ...docSnap.data() as UserProfile, uid: firebaseUser.uid, isGuest: false });
          } else {
             // Fallback for users created without profile doc (shouldn't happen with our modal)
             setUser({
                 uid: firebaseUser.uid,
                 name: firebaseUser.displayName || 'User',
                 email: firebaseUser.email || '',
                 mobile: '',
                 isGuest: false
             });
          }
        } catch (e) {
            console.error("Error fetching user profile", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, data, { merge: true });
        setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (e) {
        console.error("Error updating profile", e);
        throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('sanghavi_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};