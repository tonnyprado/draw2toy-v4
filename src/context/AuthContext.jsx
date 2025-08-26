// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../backend/firebase/firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { uid, email, ... } o null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => off();
  }, []);

  // APIs simples (puedes usarlas en tus páginas Login/SignUp si quieres)
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
