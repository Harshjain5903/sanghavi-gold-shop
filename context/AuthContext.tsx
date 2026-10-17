import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { removeKey } from '../lib/storage';

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

// Older versions cached the profile (name, email, phone) in localStorage. Remove that copy.
const clearLegacyStoredUser = () => removeKey(USER_STORAGE_KEY);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Signed-out until Firebase confirms the session, so the UI never shows a stale "logged in" state.
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearLegacyStoredUser();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const fromAccount = normalizeProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        mobile: firebaseUser.phoneNumber || '',
      });

      try {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Record<string, unknown>;
          setUser(
            normalizeProfile({
              uid: firebaseUser.uid,
              name: String(data.name || fromAccount.name),
              email: fromAccount.email || String(data.email || ''),
              mobile: String(data.mobile || data.phone || data.phoneNumber || fromAccount.mobile || ''),
            }),
          );
        } else {
          // First sign-in without a profile document: create it once.
          setUser(fromAccount);
          await setDoc(docRef, {
            uid: firebaseUser.uid,
            name: fromAccount.name,
            email: fromAccount.email,
            mobile: fromAccount.mobile,
            createdAt: new Date().toISOString(),
            isGuest: false,
          });
        }
      } catch (e) {
        console.error('Error loading user profile', e);
        setUser(fromAccount);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (changes: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    // Only name and mobile are editable here; the email is the sign-in email and comes from Firebase.
    const data: Partial<UserProfile> = {};
    if (changes.name !== undefined) data.name = changes.name.trim().slice(0, 100);
    if (changes.mobile !== undefined) data.mobile = normalizeMobile(changes.mobile).slice(0, 15);
    try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, data, { merge: true });
        setUser(prev => (prev ? normalizeProfile({ ...prev, ...data }) : null));
    } catch (e) {
        console.error("Error updating profile", e);
        throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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