
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Define the expected structure of Firebase config values from environment variables
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

// Check for missing or placeholder environment variables
const missingVars: string[] = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key_placeholder") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY (is missing or a placeholder)");
if (!firebaseConfig.authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.projectId || firebaseConfig.projectId === "your_project_id_placeholder") missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID (is missing or a placeholder)");
if (!firebaseConfig.storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfig.messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfig.appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

if (missingVars.length > 0) {
  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing or placeholders. Firebase cannot initialize.
    Problematic Variables: ${missingVars.join('; ')}.
    PLEASE SET THESE CORRECTLY IN YOUR PROJECT'S ENVIRONMENT VARIABLE SETTINGS IN THE FIREBASE STUDIO UI.
    (API Key value code is attempting to use: '${firebaseConfig.apiKey}', Project ID value code is attempting to use: '${firebaseConfig.projectId}')`;
  
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
        apiKey: firebaseConfig.apiKey as string, // Cast as string after check
        authDomain: firebaseConfig.authDomain as string,
        projectId: firebaseConfig.projectId as string,
        storageBucket: firebaseConfig.storageBucket as string,
        messagingSenderId: firebaseConfig.messagingSenderId as string,
        appId: firebaseConfig.appId as string,
      });
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    // console.log("Firebase initialized successfully using environment variables.");
  } catch (error: any) {
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED.
    Error: ${error.message || error}
    Config values from environment variables:
      API Key: '${firebaseConfig.apiKey}'
      Project ID: '${firebaseConfig.projectId}'
    Please verify:
    1. All NEXT_PUBLIC_FIREBASE_... environment variables are correctly set in Firebase Studio.
    2. 'Identity Toolkit API' is enabled in Google Cloud Console for project '${firebaseConfig.projectId}'.
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
  // If firebaseInitializationError was already set due to missing env vars
  app = undefined;
  auth = undefined;
  db = undefined;
}

if (firebaseInitializationError && auth === undefined && db === undefined) {
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable. Review previous logs for details.", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
