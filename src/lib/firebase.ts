
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

console.log("Firebase Config Object to be used for initialization:", firebaseConfig);

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_firebase_api_key") {
  const errorMessage = "CRITICAL ERROR: Firebase API Key is UNDEFINED or is a PLACEHOLDER in firebaseConfig. Check environment variables. Value: " + firebaseConfig.apiKey;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

if (!firebaseConfig.projectId) {
  const errorMessage = "CRITICAL ERROR: Firebase Project ID is UNDEFINED in firebaseConfig. Check environment variables. Value: " + firebaseConfig.projectId;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

if (!firebaseConfig.authDomain) {
  const errorMessage = "CRITICAL ERROR: Firebase Auth Domain is UNDEFINED in firebaseConfig. Check environment variables. Value: " + firebaseConfig.authDomain;
  console.error(errorMessage);
  throw new Error(errorMessage);
}


let app: FirebaseApp;
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
    console.error("CRITICAL: Firebase initialization FAILED:", initError);
    console.error("Using firebaseConfig during failed init:", firebaseConfig);
    throw initError;
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

let auth: Auth;
let db: Firestore;

try {
  auth = getAuth(app);
  console.log("Firebase Auth instance CREATED.");
} catch (authError: any) {
  console.error("CRITICAL: Firebase getAuth FAILED:", authError);
  console.error("App object used for getAuth:", app);
  throw authError;
}

try {
  db = getFirestore(app);
  console.log("Firebase Firestore instance CREATED.");
  if (db && db.app && db.app.options) {
      console.log("Firestore project ID from instance:", db.app.options.projectId);
  }
} catch (firestoreError: any) {
  console.error("CRITICAL: Firebase getFirestore FAILED:", firestoreError);
  console.error("App object used for getFirestore:", app);
  throw firestoreError;
}

export { app, auth, db };
