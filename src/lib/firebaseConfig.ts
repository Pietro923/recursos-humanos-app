// lib/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "pueble-sa.firebaseapp.com",
  projectId: "pueble-sa",
  storageBucket: "pueble-sa.appspot.com",
  messagingSenderId: "945888451886",
  appId: "1:945888451886:web:590584b9fcf2f9d7462ebf"
};

// Initialize Firebase if not already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

// Configure auth persistence
const auth = getAuth();
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence: ", error);
});

const db = getFirestore();

export { auth, db };
export default firebaseConfig;
