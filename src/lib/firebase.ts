
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration (hardcoded as per user confirmation)
const firebaseConfig = {
  apiKey: "AIzaSyCTznSshOmyhXqEvCHSPIqr8Z6OC9Yz7Ek",
  authDomain: "date-screener.firebaseapp.com",
  projectId: "date-screener",
  storageBucket: "date-screener.firebasestorage.app",
  messagingSenderId: "350867348509",
  appId: "1:350867348509:web:fd4d6403f36f03ea637af4"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let firebaseInitializationError: string | null = null;

// This log is just to see if this file is executed on server or client
if (typeof window === 'undefined') {
  // console.log("SERVER_SIDE_FIREBASE_INIT_ATTEMPT: src/lib/firebase.ts is being executed server-side.");
} else {
  // console.log("CLIENT_SIDE_FIREBASE_INIT_ATTEMPT: src/lib/firebase.ts is being executed client-side.");
}

// Check if critical config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMessage = `CRITICAL FIREBASE CONFIG ERROR: The hardcoded firebaseConfig object in src/lib/firebase.ts is missing apiKey or projectId. Firebase cannot initialize.
    API Key (hardcoded): '${firebaseConfig.apiKey}'
    Project ID (hardcoded): '${firebaseConfig.projectId}'`;
  
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
    let detailedErrorMessage = `CRITICAL: Firebase initialization of core services FAILED.
    Error: ${error.message || error}
    Config used by the code (hardcoded):
      API Key: '${firebaseConfig.apiKey}'
      Project ID: '${firebaseConfig.projectId}'
    Please verify:
    1. 'Identity Toolkit API' is enabled in Google Cloud Console for project '${firebaseConfig.projectId}'.
    2. Your Google Cloud project billing is active.
    3. Network connectivity to Firebase services.`;

    console.error("FIREBASE_INIT_ERROR (core services):", detailedErrorMessage);
    if (!firebaseInitializationError) {
        firebaseInitializationError = detailedErrorMessage;
    }
    // Ensure services are undefined if init fails
    app = undefined;
    auth = undefined;
    db = undefined;
  }
} else {
  // If firebaseInitializationError was already set due to missing hardcoded values
  app = undefined;
  auth = undefined;
  db = undefined;
}

if (firebaseInitializationError && auth === undefined && db === undefined) {
  console.error("Firebase Initialization resulted in an error, Auth and DB services are unavailable. Review previous logs for details.", firebaseInitializationError);
}

export { app, auth, db, firebaseInitializationError };
