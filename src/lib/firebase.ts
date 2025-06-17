
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

// Explicitly log the API key being used on the server-side for verification
if (isServer) {
  console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_firebase_api_key") {
    console.error("SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing, is a placeholder, or was not correctly passed to the server environment!");
    firebaseInitializationError = "SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid.";
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or was not correctly passed to the server environment!");
    if (!firebaseInitializationError) { // Don't overwrite a more specific API key error
        firebaseInitializationError = "SERVER_SIDE_FIREBASE_INIT_ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or invalid.";
    }
  }
}


// Initial check for critical environment variables (client-side context check still useful for completeness)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || !firebaseConfig.projectId) {
  let missingVars = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing or are placeholders: ${missingVars.join(', ')}. Firebase cannot initialize. Please set them correctly in your project environment.`;
  
  if (!firebaseInitializationError) { // Prioritize server-side detected errors
    firebaseInitializationError = errorMessage;
  }
  // This console.error will also appear in client browser if env vars are not bundled correctly by Next.js
  console.error("FIREBASE_CONFIG_ERROR (will show in server or client logs):", errorMessage);
}


if (!firebaseInitializationError) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (initError: any) {
      const errorMessage = `CRITICAL: Firebase initializeApp FAILED: ${initError.message || initError}. Config used: ${JSON.stringify(firebaseConfig)}`;
      console.error("FIREBASE_INIT_ERROR (initializeApp):", errorMessage);
      firebaseInitializationError = errorMessage;
    }
  } else {
    app = getApp();
  }

  // @ts-ignore app should be defined if no error previously
  if (app && !firebaseInitializationError) { 
    try {
      auth = getAuth(app);
    } catch (authError: any) {
      const errorMessage = `CRITICAL: Firebase getAuth FAILED: ${authError.message || authError}`;
      console.error("FIREBASE_INIT_ERROR (getAuth):", errorMessage);
      firebaseInitializationError = errorMessage;
      // @ts-ignore
      auth = undefined; 
    }

    try {
      db = getFirestore(app);
    } catch (firestoreError: any) {
      const errorMessage = `CRITICAL: Firebase getFirestore FAILED: ${firestoreError.message || firestoreError}`;
      console.error("FIREBASE_INIT_ERROR (getFirestore):", errorMessage);
      firebaseInitializationError = errorMessage;
      // @ts-ignore
      db = undefined; 
    }
  }
}

if (firebaseInitializationError && !isServer && typeof window !== 'undefined') {
  console.error("Firebase Initialization Error (Client-side notification):", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
