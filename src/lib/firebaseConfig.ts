// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence  } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: "pueble-sa.firebaseapp.com",
projectId: "pueble-sa",
storageBucket: "pueble-sa.appspot.com",
messagingSenderId: "945888451886",
appId: "1:945888451886:web:590584b9fcf2f9d7462ebf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence: ", error);
});
const db = getFirestore()

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  const userDoc = await getDoc(doc(db, "users", user.uid))
  if (userDoc.exists()) {
    return { uid: user.uid, email: user.email, role: userDoc.data().role }
  }
  throw new Error("User does not exist in Firestore")
}

export default firebaseConfig