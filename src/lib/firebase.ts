
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
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key" || !firebaseConfig.projectId) {
  let missingVars = [];
  if (!firebaseConfig.apiKey) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
  } else if (firebaseConfig.apiKey === "your_firebase_api_key") {
    missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY (is still the placeholder 'your_firebase_api_key' - **THIS MUST BE FIXED IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");
  }
  if (!firebaseConfig.projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID (is missing or undefined - **THIS MUST BE SET IN FIREBASE STUDIO ENVIRONMENT VARIABLE SETTINGS UI**)");

  const errorMessage = `CRITICAL FIREBASE ENV VAR ERROR: The following required environment variables are missing, placeholders, or undefined. Firebase cannot initialize. 
    Problematic Variables: ${missingVars.join('; ')}. 
    PLEASE VERIFY AND SET THEM CORRECTLY IN YOUR PROJECT'S ENVIRONMENT VARIABLE SETTINGS IN THE FIREBASE STUDIO UI. 
    (API Key value code is trying to use: '${firebaseConfig.apiKey}', Project ID value code is trying to use: '${firebaseConfig.projectId}')`;

  if (!firebaseInitializationError) {
    firebaseInitializationError = errorMessage;
  }
  console.error("FIREBASE_CONFIG_ERROR_IN_CODE:", errorMessage);
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
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED. This often happens if environment variables (API Key, Project ID) are incorrect/missing in your Firebase Studio project settings, or if the Identity Toolkit API is not enabled in Google Cloud, or due to network issues/restrictions.
    Error: ${error.message || error}
    Config used by the code:
      API Key: '${firebaseConfig.apiKey}' (This is the value your build process sees for NEXT_PUBLIC_FIREBASE_API_KEY)
      Project ID: '${firebaseConfig.projectId}' (from NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      Auth Domain: '${firebaseConfig.authDomain}' (from NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    Please verify:
    1. NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and other NEXT_PUBLIC_FIREBASE_... variables are correctly set in your Firebase Studio environment variable settings UI.
    2. The API Key (${firebaseConfig.apiKey}) is unrestricted or allows 'Identity Toolkit API' in Google Cloud Console.
    3. 'Identity Toolkit API' is enabled in Google Cloud Console for project '${firebaseConfig.projectId}'.
    4. Your Google Cloud project billing is active.
    5. Network connectivity to Firebase services.`;

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
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable. Review previous logs for details. This usually requires fixing environment variables in Firebase Studio settings.", firebaseInitializationError);
}


export { app, auth, db, firebaseInitializationError };

    