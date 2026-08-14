import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-2fPwt-vuC_lyRWz_7BMmAh2sfSmL-WI",
  authDomain: "zorvexa-68367.firebaseapp.com",
  projectId: "zorvexa-68367",
  storageBucket: "zorvexa-68367.firebasestorage.app",
  messagingSenderId: "755032805461",
  appId: "1:755032805461:web:59dc120ebf94c81d1144dc"
};

export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
