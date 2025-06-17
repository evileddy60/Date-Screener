
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

const missingVars: string[] = [];

// Check for missing or placeholder environment variables
const placeholderApiKey = "your_firebase_api_key_placeholder";
const specificIncorrectApiKey = "AIzaSyCZ0LHVRW1lUU_DBwkIcjhNvyq6x9DmC5I"; // Example of a known incorrect key if needed for checks
const placeholderProjectId = "your_project_id_placeholder";

if (!firebaseConfigFromEnv.apiKey || firebaseConfigFromEnv.apiKey === placeholderApiKey || firebaseConfigFromEnv.apiKey === specificIncorrectApiKey) {
  missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (!firebaseConfigFromEnv.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfigFromEnv.projectId || firebaseConfigFromEnv.projectId === placeholderProjectId) {
  missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}
if (!firebaseConfigFromEnv.storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfigFromEnv.messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfigFromEnv.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

if (missingVars.length > 0) {
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required Firebase environment variables are missing or placeholders from your .env file (or Firebase Studio environment variable settings UI). Firebase cannot initialize.
    Problematic Variables: ${missingVars.join('; ')}.
    PLEASE VERIFY AND SET THEM CORRECTLY in your .env file at the project root or in your Firebase Studio project's environment variable settings UI.
    (API Key value code is trying to use: '${firebaseConfigFromEnv.apiKey}', Project ID value code is trying to use: '${firebaseConfigFromEnv.projectId}')`;
  
  if (!firebaseInitializationError) { // Set error only if not already set by a more critical failure
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
    
    // This console log helps verify on the server-side (build time or server components) if available
    // For client-side, AuthContext has a similar log.
    if (typeof window === 'undefined') {
      console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", firebaseConfig.apiKey);
      console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_PROJECT_ID:", firebaseConfig.projectId);
    }


    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    // console.log("Firebase initialized successfully using environment variables."); // Keep this commented for cleaner logs unless debugging init itself
  } catch (error: any) {
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED.
    Error: ${error.message || error}
    This can happen if environment variables are set but incorrect, or if there's an issue with the Firebase project configuration itself (e.g., Identity Toolkit API not enabled, billing issues).
    Config values attempted from environment variables:
      API Key: '${firebaseConfigFromEnv.apiKey}' (from NEXT_PUBLIC_FIREBASE_API_KEY)
      Project ID: '${firebaseConfigFromEnv.projectId}' (from NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    Please verify:
    1. All NEXT_PUBLIC_FIREBASE_... environment variables are correctly set in your .env file or Firebase Studio environment variable settings UI.
    2. 'Identity Toolkit API' is enabled in Google Cloud Console (https://console.cloud.google.com/) for project '${firebaseConfigFromEnv.projectId}'.
    3. Your Google Cloud project billing is active.
    4. Network connectivity to Firebase services.`;

    console.error("FIREBASE_INIT_ERROR (core services):", detailedErrorMessage);
    if (!firebaseInitializationError) {
        firebaseInitializationError = detailedErrorMessage;
    }
    // Ensure services are undefined on critical failure
    app = undefined;
    auth = undefined;
    db = undefined;
  }
} else {
  // If firebaseInitializationError was already set due to missing env vars, ensure services are undefined
  app = undefined;
  auth = undefined;
  db = undefined;
}

if (firebaseInitializationError && auth === undefined && db === undefined) {
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable. Review previous logs for details. Error:", firebaseInitializationError);
}


export { app, auth, db, firebaseInitializationError };
