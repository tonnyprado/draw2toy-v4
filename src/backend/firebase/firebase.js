// src/backend/firebase/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// ⚠️ Vite solo expone variables que empiecen con VITE_
// Usa .env.local para sobreescribir; aquí dejo fallback con TU nuevo proyecto.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDLWqwUDi8s2N7wzfOxNNhXAU33ECLw4Hs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "draw2toy4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "draw2toy4",
  // ⚠️ IMPORTANTE: el bucket correcto termina en .appspot.com (no *.firebasestorage.app)
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "draw2toy4.appspot.com",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:598909217057:web:af944083ccd46ebd65f660",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9Y4NNCNVLQ",
};

// Evita doble init con HMR de Vite
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// SDKs que usas en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics opcional (solo funciona en https/producción)
export let analytics = null;
isSupported()
  .then((ok) => { if (ok) analytics = getAnalytics(app); })
  .catch(() => { /* noop */ });

export default app;
