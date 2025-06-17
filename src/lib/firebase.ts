
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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
let firebaseInitializationError: string | null = null;

// Check for missing or placeholder environment variables
const missingVars: string[] = [];
const placeholderApiKey = "your_firebase_api_key_placeholder"; // Common placeholder to check against
const placeholderProjectId = "your_project_id_placeholder"; // Common placeholder

if (!firebaseConfigFromEnv.apiKey || firebaseConfigFromEnv.apiKey === placeholderApiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY (is missing, a placeholder, or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigFromEnv.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigFromEnv.projectId || firebaseConfigFromEnv.projectId === placeholderProjectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID (is missing, a placeholder, or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigFromEnv.storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigFromEnv.messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigFromEnv.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");

if (missingVars.length > 0) {
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing, placeholders, or undefined. Firebase cannot initialize. 
    Problematic Variables: ${missingVars.join('; ')}. 
    PLEASE VERIFY AND SET THEM CORRECTLY IN YOUR PROJECT'S ENVIRONMENT VARIABLE SETTINGS IN THE FIREBASE STUDIO UI. 
    (API Key value code is trying to use: '${firebaseConfigFromEnv.apiKey}', Project ID value code is trying to use: '${firebaseConfigFromEnv.projectId}')`;
  
  if (!firebaseInitializationError) {
    firebaseInitializationError = errorMessage;
  }
  console.error("FIREBASE_ENV_VAR_ERROR:", errorMessage);
}


if (!firebaseInitializationError) {
  try {
    if (!getApps().length) {
      app = initializeApp({
        apiKey: firebaseConfigFromEnv.apiKey as string,
        authDomain: firebaseConfigFromEnv.authDomain as string,
        projectId: firebaseConfigFromEnv.projectId as string,
        storageBucket: firebaseConfigFromEnv.storageBucket as string,
        messagingSenderId: firebaseConfigFromEnv.messagingSenderId as string,
        appId: firebaseConfigFromEnv.appId as string,
      });
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    if (typeof window === 'undefined') { // Server-side log
        console.log("SERVER_SIDE_FIREBASE_INIT: Attempting to use NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    }
  } catch (error: any) {
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED.
    Error: ${error.message || error}
    Config values from environment variables:
      API Key: '${firebaseConfigFromEnv.apiKey}' (from NEXT_PUBLIC_FIREBASE_API_KEY)
      Project ID: '${firebaseConfigFromEnv.projectId}' (from NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    Please verify:
    1. All NEXT_PUBLIC_FIREBASE_... environment variables are correctly set in the Firebase Studio IDE.
    2. 'Identity Toolkit API' is enabled in Google Cloud Console for project '${firebaseConfigFromEnv.projectId}'.
    3. Your Google Cloud project billing is active.
    4. Network connectivity to Firebase services.`;

    console.error("FIREBASE_INIT_ERROR (core services):", detailedErrorMessage);
    if (!firebaseInitializationError) {
        firebaseInitializationError = detailedErrorMessage;
    }
    app = undefined;
    auth = undefined;
    db = undefined;
  }
} else {
  app = undefined;
  auth = undefined;
  db = undefined;
}

if (firebaseInitializationError && auth === undefined && db === undefined) {
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable. Review previous logs for details.", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
