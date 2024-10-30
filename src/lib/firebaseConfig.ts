// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

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

export default firebaseConfig