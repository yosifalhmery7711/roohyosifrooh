import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Use environment variables for Vercel/APK compatibility with fallback to AI Studio config
const finalConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || "",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || "",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || "",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || "",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || "",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || firebaseConfig.appId || "",
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || "",
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || ""
};

export const isFirebasePlaceholder = 
  !finalConfig.projectId || 
  finalConfig.projectId.includes('remixed') || 
  finalConfig.projectId.includes('placeholder') ||
  finalConfig.apiKey?.includes('remixed') ||
  finalConfig.apiKey?.includes('placeholder') ||
  !finalConfig.apiKey;

const app = initializeApp(finalConfig);
export const db = finalConfig.firestoreDatabaseId 
  ? getFirestore(app, finalConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  if (isFirebasePlaceholder) {
    console.warn("⚠️ Firebase is currently in placeholder mode. Please set up a live Firebase project in AI Studio to activate cloud syncing.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully");
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      console.error("Firebase is offline. Check configuration.");
    }
  }
}
testConnection();
