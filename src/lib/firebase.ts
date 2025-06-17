
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

// Initial check for critical environment variables
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || !firebaseConfig.projectId) {
  let missingVars = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing or are placeholders: ${missingVars.join(', ')}. Firebase cannot initialize. Please set them correctly in your project environment.`;
  console.error(errorMessage);
  firebaseInitializationError = errorMessage;
  
  // For server-side, always throw if critical vars are missing
  if (isServer) {
    // throw new Error(errorMessage); 
    // Commented out to prevent server crash during build if vars are temporarily unset, but good for stricter local dev
  }
}


if (!firebaseInitializationError) {
  if (!getApps().length) {
    try {
      // console.log("Attempting to initialize Firebase app with config:", firebaseConfig);
      app = initializeApp(firebaseConfig);
      // console.log("Firebase app initialized successfully.");
    } catch (initError: any) {
      const errorMessage = `CRITICAL: Firebase initializeApp FAILED: ${initError.message || initError}. Config used: ${JSON.stringify(firebaseConfig)}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
       if (isServer) {
        // throw initError;
      }
    }
  } else {
    app = getApp();
    // console.log("Firebase app already initialized, getting existing app.");
  }

  // @ts-ignore app should be defined if no error previously
  if (app && !firebaseInitializationError) { 
    try {
      auth = getAuth(app);
      // console.log("Firebase Auth initialized successfully.");
    } catch (authError: any) {
      const errorMessage = `CRITICAL: Firebase getAuth FAILED: ${authError.message || authError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      firebaseInitializationError = errorMessage;
      if (isServer) {
        // throw authError;  
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
      if (isServer) {
        // throw firestoreError; 
      }
      // @ts-ignore
      db = undefined; 
    }
  }
}

if (firebaseInitializationError && !isServer && typeof window !== 'undefined') {
  // Optionally, show a toast to the user on the client-side if init failed critically
  // This is handled in AuthContext now, so no need for direct toast here.
  console.error("Firebase Initialization Error (Client-side):", firebaseInitializationError);
}


export { app, auth, db, firebaseInitializationError };
