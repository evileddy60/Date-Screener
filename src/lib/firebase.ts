
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Log the raw environment variables as read by the process
console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log("RAW ENV: NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("Constructed firebaseConfig object:", firebaseConfig);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitializationError: string | null = null;

const isServer = typeof window === 'undefined';

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || firebaseConfig.apiKey === "AIzaSyCZ0LHVRW1lUU_DBwkIcjhNvyq6x9DmC5I") {
  const errorMessage = "CRITICAL ERROR: Firebase API Key is UNDEFINED or is a PLACEHOLDER in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_API_KEY). Value: " + firebaseConfig.apiKey;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer) { 
    throw new Error(errorMessage);
  }
}

if (!firebaseConfig.projectId && !firebaseInitializationError) {
  const errorMessage = "CRITICAL ERROR: Firebase Project ID is UNDEFINED in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_PROJECT_ID). Value: " + firebaseConfig.projectId;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer) {
    throw new Error(errorMessage);
  }
}

if (!firebaseConfig.authDomain && !firebaseInitializationError) {
  const errorMessage = "CRITICAL ERROR: Firebase Auth Domain is UNDEFINED in firebaseConfig. Check environment variables (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN). Value: " + firebaseConfig.authDomain;
  console.error("FIREBASE_INIT_ERROR:", errorMessage);
  firebaseInitializationError = errorMessage;
  if (!isServer) {
    throw new Error(errorMessage);
  }
}


if (!firebaseInitializationError) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase App Initialized SUCCESSFULLY. App Name:", app.name);
      if (app.options) {
        console.log("Initialized App Options - Project ID:", app.options.projectId);
        console.log("Initialized App Options - API Key used:", app.options.apiKey);
        console.log("Initialized App Options - Auth Domain:", app.options.authDomain);
      }
    } catch (initError: any) {
      const errorMessage = `CRITICAL: Firebase initializeApp FAILED: ${initError.message || initError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      console.error("Using firebaseConfig during failed init:", firebaseConfig);
      firebaseInitializationError = errorMessage;
      if (!isServer) {
        throw initError;
      }
    }
  } else {
    app = getApp();
    console.log("Firebase App Retrieved (already initialized). App Name:", app.name);
     if (app.options) {
        console.log("Retrieved App Options - Project ID:", app.options.projectId);
        console.log("Retrieved App Options - API Key used:", app.options.apiKey);
        console.log("Retrieved App Options - Auth Domain:", app.options.authDomain);
     }
  }

  // Initialize Auth and Firestore only if app was successfully initialized
  // and no prior critical errors occurred.
  if (app! && !firebaseInitializationError) { // Added null assertion for app as it would be set if no error
    try {
      auth = getAuth(app);
      console.log("Firebase Auth instance CREATED.");
    } catch (authError: any) {
      const errorMessage = `CRITICAL: Firebase getAuth FAILED: ${authError.message || authError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      console.error("App object used for getAuth:", app);
      firebaseInitializationError = errorMessage;
      if (!isServer) {
        throw authError;
      }
      // @ts-ignore
      auth = undefined; 
    }

    try {
      db = getFirestore(app);
      console.log("Firebase Firestore instance CREATED.");
      if (db && db.app && db.app.options) {
          console.log("Firestore project ID from instance:", db.app.options.projectId);
      }
    } catch (firestoreError: any)
{
      const errorMessage = `CRITICAL: Firebase getFirestore FAILED: ${firestoreError.message || firestoreError}`;
      console.error("FIREBASE_INIT_ERROR:", errorMessage);
      console.error("App object used for getFirestore:", app);
      firebaseInitializationError = errorMessage;
      if (!isServer) {
        throw firestoreError;
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
