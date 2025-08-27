// src/frontend/SignUp.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isAdmin } from "../utils/roles.js";

export default function SignUp() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(email, pass);
      if (isAdmin({ email })) return nav("/admin", { replace: true });
      nav("/", { replace: true });
    } catch (err) {
      alert(err.message || "No se pudo registrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
      <h1>Crear cuenta</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" autoComplete="email" />
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="password" autoComplete="new-password" />
        <button disabled={busy}>{busy ? "Creando..." : "Registrarme"}</button>
      </form>
    </section>
  );
}
