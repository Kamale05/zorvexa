import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firestore with robust multi-tab offline persistence
function createFirestoreInstance() {
  const databaseId =
    firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
      ? firebaseConfigData.firestoreDatabaseId
      : undefined;

  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      if (databaseId) {
        return initializeFirestore(app, {
          localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        }, databaseId);
      }
      return initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    }
  } catch (err) {
    console.warn('[Firestore] Offline persistence initialization warning, falling back to standard:', err);
  }

  return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = createFirestoreInstance();

