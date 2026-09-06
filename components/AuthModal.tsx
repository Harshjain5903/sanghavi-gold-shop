import React, { useState } from 'react';
import { X, ArrowRight, User, Mail, Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { SanghaviLogo } from './Navbar';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
      setEmail('');
      setPassword('');
      setName('');
      setMobile('');
      setError('');
      setLoading(false);
  };

  const handleClose = () => {
      resetForm();
      onClose();
  };

  const saveUserProfile = async (user: User, fallbackName = '', fallbackMobile = '') => {
    const finalName = user.displayName?.trim() || fallbackName || (user.email ? user.email.split('@')[0] : 'Customer');
    const finalMobile = fallbackMobile || user.phoneNumber || '';

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: finalName,
      email: user.email || '',
      mobile: finalMobile,
      createdAt: new Date().toISOString(),
      isGuest: false,
    }, { merge: true });
  };

  const handleSocialSignIn = async (providerName: 'google' | 'facebook') => {
    setError('');
    setLoading(true);

    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserProfile(userCredential.user);
      resetForm();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already registered with another sign-in method. Please use email login or the other provider.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('This sign-in method is not enabled in Firebase. Please enable it in the Firebase console.');
      } else {
        setError(err.message || 'Social sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (mode === 'signup') {
            // 1. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Display Name
            await updateProfile(user, { displayName: name });

            // 3. Create Firestore Profile
            await saveUserProfile(user, name, mobile);

        } else {
            // Login
            await signInWithEmailAndPassword(auth, email, password);
        }

        // Success
        resetForm();
        onSuccess();
        
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
            setError('Email is already registered. Please login.');
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            setError('Invalid email or password.');
        } else if (err.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters.');
        } else {
            setError(err.message || 'Authentication failed. Please try again.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-white p-6 pb-2 flex justify-between items-center">
           <div className="flex items-center gap-2">
                 <div className="w-8 h-8"><SanghaviLogo className="w-full h-full" /></div>
                 <div>
                    <span className="block font-serif font-bold text-lg text-brand-black leading-none">Sanghavi Gold</span>
                 </div>
           </div>
           <button onClick={handleClose} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-black transition">
             <X size={20} />
           </button>
        </div>

        <div className="px-8 pb-8 pt-4">
           <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-gray-500 text-sm">
                    {mode === 'login' ? 'Enter your credentials to access your account' : 'Join us for exclusive offers and faster checkout'}
                </p>
           </div>

           {error && (
               <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-6">
                   <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                   <span>{error}</span>
               </div>
           )}

           <div className="mb-5 space-y-3">
             <button
               type="button"
               onClick={() => handleSocialSignIn('google')}
               disabled={loading}
               className="w-full border border-gray-300 bg-white text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
             >
               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">G</span>
               Continue with Google
             </button>
             <button
               type="button"
               onClick={() => handleSocialSignIn('facebook')}
               disabled={loading}
               className="w-full border border-gray-300 bg-white text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
             >
               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">f</span>
               Continue with Facebook
             </button>
           </div>

           <div className="flex items-center gap-3 my-5">
             <div className="h-px flex-1 bg-gray-200" />
             <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">or</span>
             <div className="h-px flex-1 bg-gray-200" />
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
               {mode === 'signup' && (
                   <>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gold-500 outline-none"
                                placeholder="e.g. Rahul Sharma"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="tel" 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gold-500 outline-none"
                                placeholder="10 Digit Mobile Number"
                                maxLength={10}
                                value={mobile}
                                onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    </div>
                   </>
               )}

               <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gold-500 outline-none"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
               </div>

               <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gold-500 outline-none"
                            placeholder="••••••••"
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
               </div>
               
               <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-black text-white py-3.5 rounded-lg font-bold hover:bg-gold-600 transition shadow-lg mt-6 flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 size={20} className="animate-spin" /> : (
                     <>
                        {mode === 'login' ? 'Login' : 'Sign Up'} <ArrowRight size={18} />
                     </>
                 )}
               </button>
           </form>

           <div className="mt-6 text-center text-sm text-gray-500">
               {mode === 'login' ? (
                   <p>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }} className="text-gold-600 font-bold hover:underline">Sign Up</button></p>
               ) : (
                   <p>Already have an account? <button onClick={() => { setMode('login'); setError(''); }} className="text-gold-600 font-bold hover:underline">Login</button></p>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;