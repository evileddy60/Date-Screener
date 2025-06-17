
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Direct configuration object as provided
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if projectId is defined. If not, Firestore (and other services) won't know where to connect.
// This is a common reason for "client is offline" or similar connection errors with Firestore.
if (!firebaseConfig.projectId) {
  console.error("Firebase project ID is NOT defined in the configuration. Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is set correctly.");
  throw new Error(
    "Firebase project ID is not defined in the configuration. Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is set correctly."
  );
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

export { app, auth, db };
