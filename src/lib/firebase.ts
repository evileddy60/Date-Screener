
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
  // This log will appear in your Firebase Studio server logs
  console.log("SERVER_SIDE_FIREBASE_INIT: Using NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
}

// Check for placeholder or missing critical environment variables
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || !firebaseConfig.projectId) {
  let missingVars = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY (is placeholder or missing)");
  if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID (is missing)");

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
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED. This often happens if environment variables (API Key, Project ID) are incorrect or missing, or if the Identity Toolkit API is not enabled, or due to network issues/restrictions.
    Error: ${error.message || error}
    Config used:
      API Key: '${firebaseConfig.apiKey}' (This is the value your build process sees)
      Project ID: '${firebaseConfig.projectId}'
      Auth Domain: '${firebaseConfig.authDomain}'
    Please verify:
    1. NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are correctly set in your Firebase Studio environment variables.
    2. The API Key is unrestricted or allows 'Identity Toolkit API' in Google Cloud Console.
    3. 'Identity Toolkit API' is enabled in Google Cloud Console for project '${firebaseConfig.projectId}'.
    4. Your Google Cloud project billing is active.
    5. Network connectivity to Firebase services.`;

    console.error("FIREBASE_INIT_ERROR (core services):", detailedErrorMessage);
    if (!firebaseInitializationError) {
        firebaseInitializationError = detailedErrorMessage;
    }
    // Ensure services are undefined if initialization fails
    app = undefined;
    auth = undefined;
    db = undefined;
  }
} else {
  // If firebaseInitializationError was set by the config check, ensure services are undefined
  app = undefined;
  auth = undefined;
  db = undefined;
}

if (firebaseInitializationError && auth === undefined && db === undefined) {
  // This log ensures the error is highly visible if initialization failed at any point.
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable:", firebaseInitializationError);
}


export { app, auth, db, firebaseInitializationError };
