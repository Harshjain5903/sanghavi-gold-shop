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

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const isPhoneLike = (value: string) => {
  const digits = digitsOnly(value);
  return digits.length >= 10 && digits.length <= 15;
};

const normalizeMobile = (value?: string) => {
  if (!value) return '';
  const digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
};

const formatNameFromEmail = (email?: string) => {
  if (!email) return 'User';
  const local = email.split('@')[0] || '';
  const readable = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!readable) return 'User';
  return readable
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const normalizeProfile = (profile: Partial<UserProfile>): UserProfile => {
  const email = (profile.email || '').trim();
  let name = (profile.name || '').trim();
  let mobile = normalizeMobile(profile.mobile);

  // Smart correction for legacy bad data: phone number saved in the name field.
  if ((!mobile || mobile.length < 10) && name && isPhoneLike(name)) {
    mobile = normalizeMobile(name);
    name = '';
  }

  if (!name) {
    name = formatNameFromEmail(email);
  }

  return {
    uid: profile.uid,
    name,
    email,
    mobile,
    isGuest: false,
  };
};

const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return normalizeProfile({
      uid: parsed.uid,
      name: parsed.name,
      email: parsed.email,
      mobile: parsed.mobile,
    });
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

          const fallbackProfile = normalizeProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || storedUser?.name || '',
            email: firebaseUser.email || storedUser?.email || '',
            mobile: firebaseUser.phoneNumber || storedUser?.mobile || '',
          });
          
          if (docSnap.exists()) {
             const data = docSnap.data() as Record<string, unknown>;
             const profile = normalizeProfile({
               ...fallbackProfile,
               ...(data as Partial<UserProfile>),
               mobile: String(data.mobile || data.phone || data.phoneNumber || fallbackProfile.mobile || ''),
               uid: firebaseUser.uid,
             });
             setUser(profile);
             saveStoredUser(profile);

             // Keep Firestore profile clean for future sessions.
             const needsRepair =
               data.name !== profile.name ||
               String(data.mobile || data.phone || data.phoneNumber || '') !== profile.mobile ||
               data.email !== profile.email;

             if (needsRepair) {
               await setDoc(docRef, {
                 name: profile.name,
                 mobile: profile.mobile,
                 email: profile.email,
                 isGuest: false,
               }, { merge: true });
             }
          } else {
             // Fallback for users created without profile doc (shouldn't happen with our modal)
             setUser(fallbackProfile);
             saveStoredUser(fallbackProfile);

             await setDoc(docRef, {
               name: fallbackProfile.name,
               mobile: fallbackProfile.mobile,
               email: fallbackProfile.email,
               isGuest: false,
             }, { merge: true });
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
          const updated = normalizeProfile({ ...prev, ...data });
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