
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Log the value of the API key environment variable as seen by the application
console.log("Attempting to read NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("Attempting to read NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log the configuration object that will be used
console.log("Firebase configuration object being used:", firebaseConfig);

// Check if critical Firebase configuration values are defined.
if (!firebaseConfig.apiKey) {
  const errorMessage = "Firebase API Key is not defined. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your Firebase Studio project's environment variable settings.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

if (!firebaseConfig.projectId) {
  const errorMessage = "Firebase project ID is not defined in the configuration. Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is set correctly in your Firebase Studio project's environment variable settings.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase App Initialized.");
} else {
  app = getApp();
  console.log("Firebase App Retrieved.");
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
console.log("Firestore instance requested. DB Object:", db ? "Exists" : "Does Not Exist");
if (db && db.app && db.app.options) {
    console.log("Firestore project ID from instance:", db.app.options.projectId);
}


export { app, auth, db };
