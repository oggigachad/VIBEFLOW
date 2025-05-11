// Firebase configuration
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB9Hivu5Ivk0Mejxlp82O7UzYXVI6MSNQ4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vibeflow-bc788.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vibeflow-bc788",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vibeflow-bc788.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "764593296690",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:764593296690:web:15178a200ccd6d371a732b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WQ0WN84FCZ"
};

// Initialize Firebase only in browser environment
const initFirebase = (): FirebaseApp | null => {
  if (typeof window !== 'undefined') {
    try {
      // Initialize Firebase if it hasn't been initialized yet
      return !getApps().length ? initializeApp(firebaseConfig) : getApp();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      return null;
    }
  }
  return null;
};

// Initialize services safely
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

// Ensure this only runs on client
if (typeof window !== 'undefined') {
  app = initFirebase();
  db = app ? getFirestore(app) : null;
  auth = app ? getAuth(app) : null;
  storage = app ? getStorage(app) : null;
}

export { app, db, auth, storage }; 