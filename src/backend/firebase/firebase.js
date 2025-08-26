import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Usa .env.local (Vite solo expone variables que empiecen con VITE_)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBAjp5Ek6btPy5NdUxJZaPiaJKa_OOCfsY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "draw2toy-92b00.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "draw2toy-92b00",
  // IMPORTANTE: el bucket correcto termina en .appspot.com, no en firebasestorage.app
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "draw2toy-92b00.appspot.com",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:433133000389:web:4fcd67cb356a5ff8bb42ac",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FQP1WNGK9N",
};

// Evita doble init con HMR de Vite
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// SDKs que usamos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics es opcional y solo si el entorno lo permite
export let analytics = null;
isSupported()
  .then((ok) => { if (ok) analytics = getAnalytics(app); })
  .catch(() => { /* noop */ });
