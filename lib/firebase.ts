import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDdfT_No8cP1WfGNWKp7Rpoddp21fDtYqQ",
  authDomain: "sanghavi-gold.firebaseapp.com",
  projectId: "sanghavi-gold",
  storageBucket: "sanghavi-gold.appspot.com", 
  messagingSenderId: "1096140451138",
  appId: "1:1096140451138:web:49f0ce56639f7c58cf6cdb",
  measurementId: "G-71JY96ZQLP"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);