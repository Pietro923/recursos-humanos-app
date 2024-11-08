// lib/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "pueble-sa.firebaseapp.com",
  projectId: "pueble-sa",
  storageBucket: "pueble-sa.appspot.com",
  messagingSenderId: "945888451886",
  appId: "1:945888451886:web:590584b9fcf2f9d7462ebf"
};

// Inicializar Firebase si no se ha inicializado previamente
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Configurar la autenticación con persistencia de sesión en el navegador
const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

// Obtener la instancia de Firestore
const db = getFirestore(app);

// Exportar la instancia de autenticación y Firestore
export { auth, db };
export default firebaseConfig;
