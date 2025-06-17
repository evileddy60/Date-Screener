
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Define the expected structure of Firebase config values from environment variables
const firebaseConfigValues = {
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
if (!firebaseConfigValues.apiKey || firebaseConfigValues.apiKey === "your_firebase_api_key_placeholder") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY (is missing, a placeholder, or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigValues.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigValues.projectId || firebaseConfigValues.projectId === "your_project_id_placeholder") missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID (is missing, a placeholder, or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigValues.storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigValues.messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
if (!firebaseConfigValues.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");

if (missingVars.length > 0) {
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing, placeholders, or undefined. Firebase cannot initialize. 
    Problematic Variables: ${missingVars.join('; ')}. 
    PLEASE VERIFY AND SET THEM CORRECTLY IN YOUR PROJECT'S ENVIRONMENT VARIABLE SETTINGS IN THE FIREBASE STUDIO UI. 
    (API Key value code is trying to use: '${firebaseConfigValues.apiKey}', Project ID value code is trying to use: '${firebaseConfigValues.projectId}')`;
  
  if (!firebaseInitializationError) {
    firebaseInitializationError = errorMessage;
  }
  console.error("FIREBASE_ENV_VAR_ERROR:", errorMessage);
}


if (!firebaseInitializationError) {
  try {
    if (!getApps().length) {
      // Pass the config object directly, which now gets its values from process.env
      app = initializeApp({
        apiKey: firebaseConfigValues.apiKey as string,
        authDomain: firebaseConfigValues.authDomain as string,
        projectId: firebaseConfigValues.projectId as string,
        storageBucket: firebaseConfigValues.storageBucket as string,
        messagingSenderId: firebaseConfigValues.messagingSenderId as string,
        appId: firebaseConfigValues.appId as string,
      });
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    if (typeof window === 'undefined') { // Server-side log
        console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    }
  } catch (error: any) {
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED.
    Error: ${error.message || error}
    Config values from environment variables:
      API Key: '${firebaseConfigValues.apiKey}' (from NEXT_PUBLIC_FIREBASE_API_KEY)
      Project ID: '${firebaseConfigValues.projectId}' (from NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    Please verify:
    1. All NEXT_PUBLIC_FIREBASE_... environment variables are correctly set in Firebase Studio.
    2. 'Identity Toolkit API' is enabled in Google Cloud Console for project '${firebaseConfigValues.projectId}'.
    3. Your Google Cloud project billing is active.
    4. Network connectivity to Firebase services.`;

    console.error("FIREBASE_INIT_ERROR (core services):", detailedErrorMessage);
    if (!firebaseInitializationError) {
        firebaseInitializationError = detailedErrorMessage;
    }
    // Ensure these are undefined if init fails
    app = undefined;
    auth = undefined;
    db = undefined;
  }
} else {
  // If firebaseInitializationError was already set due to missing env vars
  app = undefined;
  auth = undefined;
  db = undefined;
}

if (firebaseInitializationError && auth === undefined && db === undefined) {
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable. Review previous logs for details.", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
