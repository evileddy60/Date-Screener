
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitializationError: string | null = null;

const isServer = typeof window === 'undefined';

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") {
  const errorMessage = "CRITICAL ERROR: Firebase API Key is UNDEFINED or is a PLACEHOLDER in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_API_KEY). Value: " + firebaseConfig.apiKey;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer && process.env.NODE_ENV === 'development') { 
    // Intentionally not throwing error client-side in dev for this specific template to avoid dev loop confusion with template key
  } else if (!isServer) {
     // For production client-side, or if you want to be stricter in dev client-side
     // throw new Error(errorMessage); 
  }
}


if (!firebaseInitializationError) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (initError: any) {
      const errorMessage = `CRITICAL: Firebase initializeApp FAILED: ${initError.message || initError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (!isServer && process.env.NODE_ENV === 'development') {
        // throw initError;
      }
    }
  } else {
    app = getApp();
  }

  // @ts-ignore app will be defined if no error previously
  if (app && !firebaseInitializationError) { 
    try {
      auth = getAuth(app);
    } catch (authError: any) {
      const errorMessage = `CRITICAL: Firebase getAuth FAILED: ${authError.message || authError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (!isServer && process.env.NODE_ENV === 'development') {
        // throw authError;  
      }
      // @ts-ignore
      auth = undefined; 
    }

    try {
      db = getFirestore(app);
    } catch (firestoreError: any) {
      const errorMessage = `CRITICAL: Firebase getFirestore FAILED: ${firestoreError.message || firestoreError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (!isServer && process.env.NODE_ENV === 'development') {
        // throw firestoreError; 
      }
      // @ts-ignore
      db = undefined; 
    }
  }
} else {
   console.error("FIREBASE_INIT_SKIPPED: Firebase initialization skipped due to previous critical errors. App, Auth, and DB will be undefined.");
   // @ts-ignore
   app = undefined;
   // @ts-ignore
   auth = undefined;
   // @ts-ignore
   db = undefined;
}

export { app, auth, db, firebaseInitializationError };
