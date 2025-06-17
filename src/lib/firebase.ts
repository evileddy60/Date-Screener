
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Log raw environment variables
// console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
// console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// console.log("Constructed firebaseConfig object:", firebaseConfig);


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitializationError: string | null = null;

const isServer = typeof window === 'undefined';

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") {
  const errorMessage = "CRITICAL ERROR: Firebase API Key is UNDEFINED or is a PLACEHOLDER in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_API_KEY). Value: " + firebaseConfig.apiKey;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer) { 
    // Only throw client-side to prevent server crash during SSR if env var is missing
    // Server will log the error and firebaseInitializationError will be set.
    // throw new Error(errorMessage); // Temporarily commented out to prevent app crash and see logs
  }
}

if (!firebaseConfig.projectId && !firebaseInitializationError) {
  const errorMessage = "CRITICAL ERROR: Firebase Project ID is UNDEFINED in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_PROJECT_ID). Value: " + firebaseConfig.projectId;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer) {
    // throw new Error(errorMessage); // Temporarily commented out
  }
}

if (!firebaseConfig.authDomain && !firebaseInitializationError) {
  const errorMessage = "CRITICAL ERROR: Firebase Auth Domain is UNDEFINED in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN). Value: " + firebaseConfig.authDomain;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer) {
    // throw new Error(errorMessage); // Temporarily commented out
  }
}

if (!firebaseInitializationError) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      // console.log("Firebase app initialized successfully. App options:", app.options);
    } catch (initError: any) {
      const errorMessage = `CRITICAL: Firebase initializeApp FAILED: ${initError.message || initError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (!isServer) {
        // throw initError;  // Temporarily commented out
      }
    }
  } else {
    app = getApp();
    // console.log("Firebase app already initialized. Using existing app. App options:", app.options);
  }

  // @ts-ignore app will be defined if no error previously
  if (app && !firebaseInitializationError) { 
    try {
      auth = getAuth(app);
      // console.log("Firebase Auth initialized successfully.");
    } catch (authError: any) {
      const errorMessage = `CRITICAL: Firebase getAuth FAILED: ${authError.message || authError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (!isServer) {
        // throw authError;  // Temporarily commented out
      }
      // @ts-ignore
      auth = undefined; 
    }

    try {
      db = getFirestore(app);
      // console.log("Firebase Firestore initialized successfully.");
    } catch (firestoreError: any) {
      const errorMessage = `CRITICAL: Firebase getFirestore FAILED: ${firestoreError.message || firestoreError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (!isServer) {
        // throw firestoreError; // Temporarily commented out
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
