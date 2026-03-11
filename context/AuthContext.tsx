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
const USER_STORAGE_KEY = 'sanghavi_user';

const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return {
      uid: parsed.uid,
      name: parsed.name || 'User',
      email: parsed.email || '',
      mobile: parsed.mobile || '',
      isGuest: false,
    };
  } catch {
    return null;
  }
};

const saveStoredUser = (profile: UserProfile | null) => {
  if (!profile) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const storedUser = getStoredUser();

          // Fetch extra profile details from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          const fallbackProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || storedUser?.name || 'User',
            email: firebaseUser.email || storedUser?.email || '',
            mobile: firebaseUser.phoneNumber || storedUser?.mobile || '',
            isGuest: false,
          };
          
          if (docSnap.exists()) {
             const profile = {
               ...fallbackProfile,
               ...(docSnap.data() as UserProfile),
               uid: firebaseUser.uid,
               isGuest: false,
             };
             setUser(profile);
             saveStoredUser(profile);
          } else {
             // Fallback for users created without profile doc (shouldn't happen with our modal)
             setUser(fallbackProfile);
             saveStoredUser(fallbackProfile);
          }
        } catch (e) {
            console.error("Error fetching user profile", e);
        }
      } else {
        setUser(null);
        saveStoredUser(null);
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
        setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, ...data };
          saveStoredUser(updated);
          return updated;
        });
    } catch (e) {
        console.error("Error updating profile", e);
        throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    saveStoredUser(null);
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