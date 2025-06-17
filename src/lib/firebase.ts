
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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let firebaseInitializationError: string | null = null;

const isServer = typeof window === 'undefined';

if (isServer) {
  console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_firebase_api_key") {
    console.error("SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing, is a placeholder, or was not correctly passed to the server environment!");
    firebaseInitializationError = "SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid.";
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or was not correctly passed to the server environment!");
    if (!firebaseInitializationError) {
        firebaseInitializationError = "SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or invalid.";
    }
  }
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || !firebaseConfig.projectId) {
  let missingVars = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing or are placeholders: ${missingVars.join(', ')}. Firebase cannot initialize. Please set them correctly in your project environment.`;
  
  if (!firebaseInitializationError) {
    firebaseInitializationError = errorMessage;
  }
  console.error("FIREBASE_CONFIG_ERROR (will show in server or client logs):", errorMessage);
}


if (!firebaseInitializationError) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    // If app initialization succeeded, try to get auth and db
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error: any) {
    const errorMessage = `CRITICAL: Firebase initialization of core services FAILED: ${error.message || error}. Config used: ${JSON.stringify(firebaseConfig)}`;
    console.error("FIREBASE_INIT_ERROR (core services):", errorMessage);
    firebaseInitializationError = errorMessage;
    app = undefined; 
    auth = undefined;
    db = undefined;
  }
}

// Explicitly log and ensure auth/db are undefined if there was any initialization error
if (firebaseInitializationError) {
  console.error("Firebase Initialization Error means Auth and DB services may be unavailable:", firebaseInitializationError);
  auth = undefined; 
  db = undefined;
}


if (!isServer && typeof window !== 'undefined' && firebaseInitializationError) {
  // This helps to see the error on the client side during development if it happened during server init
  // and wasn't caught by a UI notification elsewhere.
  console.error("Firebase Initialization Error (Client-side notification of potential server init issue):", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
