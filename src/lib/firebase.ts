
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage'; // Added for Firebase Storage

// Define the expected structure of Firebase config values from environment variables
const firebaseConfigFromEnv = {
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
let storage: FirebaseStorage | undefined; // Added for Firebase Storage
let firebaseInitializationError: string | null = null;

const missingVars: string[] = [];

// Check for missing or placeholder environment variables
const placeholderApiKey = "your_firebase_api_key_placeholder";
const specificIncorrectApiKey = "AIzaSyCZ0LHVRW1lUU_DBwkIcjhNvyq6x9DmC5I"; 
const placeholderProjectId = "your_project_id_placeholder";

if (!firebaseConfigFromEnv.apiKey || firebaseConfigFromEnv.apiKey === placeholderApiKey || firebaseConfigFromEnv.apiKey === specificIncorrectApiKey) {
  missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (!firebaseConfigFromEnv.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfigFromEnv.projectId || firebaseConfigFromEnv.projectId === placeholderProjectId) {
  missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}
// Storage bucket is crucial for Firebase Storage
if (!firebaseConfigFromEnv.storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfigFromEnv.messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfigFromEnv.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

if (missingVars.length > 0) {
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required Firebase environment variables are missing or placeholders from your .env file (or Firebase Studio environment variable settings UI). Firebase cannot initialize.
    Problematic Variables: ${missingVars.join('; ')}.
    PLEASE VERIFY AND SET THEM CORRECTLY in your .env file at the project root or in your Firebase Studio project's environment variable settings UI.
    (API Key value code is trying to use: '${firebaseConfigFromEnv.apiKey}', Project ID value code is trying to use: '${firebaseConfigFromEnv.projectId}')`;
  
  if (!firebaseInitializationError) { 
    firebaseInitializationError = errorMessage;
  }
  console.error("FIREBASE_ENV_VAR_ERROR:", firebaseInitializationError);
}


if (!firebaseInitializationError) {
  try {
    const firebaseConfig = {
      apiKey: firebaseConfigFromEnv.apiKey as string,
      authDomain: firebaseConfigFromEnv.authDomain as string,
      projectId: firebaseConfigFromEnv.projectId as string,
      storageBucket: firebaseConfigFromEnv.storageBucket as string,
      messagingSenderId: firebaseConfigFromEnv.messagingSenderId as string,
      appId: firebaseConfigFromEnv.appId as string,
    };
    
    if (typeof window === 'undefined') {
      console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", firebaseConfig.apiKey);
      console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_PROJECT_ID:", firebaseConfig.projectId);
      console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", firebaseConfig.storageBucket);
    }


    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app); // Initialize Firebase Storage
    
  } catch (error: any) {
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED.
    Error: ${error.message || error}
    This can happen if environment variables are set but incorrect, or if there's an issue with the Firebase project configuration itself (e.g., Identity Toolkit API not enabled, billing issues, Storage service not enabled).
    Config values attempted from environment variables:
      API Key: '${firebaseConfigFromEnv.apiKey}' (from NEXT_PUBLIC_FIREBASE_API_KEY)
      Project ID: '${firebaseConfigFromEnv.projectId}' (from NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      Storage Bucket: '${firebaseConfigFromEnv.storageBucket}' (from NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    Please verify:
    1. All NEXT_PUBLIC_FIREBASE_... environment variables are correctly set in your .env file or Firebase Studio environment variable settings UI.
    2. 'Identity Toolkit API' is enabled in Google Cloud Console (https://console.cloud.google.com/) for project '${firebaseConfigFromEnv.projectId}'.
    3. Firebase Storage service is enabled and rules are configured in the Firebase console.
    4. Your Google Cloud project billing is active.
    5. Network connectivity to Firebase services.`;

    console.error("FIREBASE_INIT_ERROR (core services):", detailedErrorMessage);
    if (!firebaseInitializationError) {
        firebaseInitializationError = detailedErrorMessage;
    }
    app = undefined;
    auth = undefined;
    db = undefined;
    storage = undefined; // Ensure storage is undefined on error
  }
} else {
  app = undefined;
  auth = undefined;
  db = undefined;
  storage = undefined; // Ensure storage is undefined if env vars were missing
}

if (firebaseInitializationError && auth === undefined && db === undefined && storage === undefined) {
  console.error("Firebase Initialization resulted in an error, Auth, DB, and Storage services are unavailable. Review previous logs for details. Error:", firebaseInitializationError);
}


export { app, auth, db, storage, firebaseInitializationError }; // Export storage
