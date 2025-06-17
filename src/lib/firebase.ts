
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

// This explicit server-side log for API key can be re-enabled if client-side verification isn't enough
// if (isServer) {
//   console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// }

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || !firebaseConfig.projectId) {
  let missingVars = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing or are placeholders: ${missingVars.join(', ')}. Firebase cannot initialize. Please set them correctly in your project environment. API Key Used: ${firebaseConfig.apiKey}, Project ID Used: ${firebaseConfig.projectId}`;
  
  if (!firebaseInitializationError) {
    firebaseInitializationError = errorMessage;
  }
  console.error("FIREBASE_CONFIG_ERROR:", errorMessage);
}


if (!firebaseInitializationError) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error: any) {
    const errorMessage = `CRITICAL: Firebase initialization of core services FAILED: ${error.message || error}. This often happens if environment variables (API Key, Project ID) are incorrect or missing. Config used: apiKey='${firebaseConfig.apiKey}', projectId='${firebaseConfig.projectId}'.`;
    console.error("FIREBASE_INIT_ERROR (core services):", errorMessage);
    firebaseInitializationError = errorMessage;
    app = undefined; 
    auth = undefined;
    db = undefined;
  }
}

if (firebaseInitializationError) {
  console.error("Firebase Initialization Error means Auth and DB services may be unavailable:", firebaseInitializationError);
  auth = undefined; 
  db = undefined;
}

if (!isServer && typeof window !== 'undefined' && firebaseInitializationError) {
  console.error("Firebase Initialization Error (Client-side notification of potential server init issue):", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
