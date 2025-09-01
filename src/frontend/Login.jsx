import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isAdmin, isAnyDesigner } from "../utils/roles.js";

export default function Login() {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation(); // viene de ProtectedRoute { from }
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (state?.from?.pathname) return nav(state.from.pathname, { replace: true });
    if (isAdmin(user)) return nav("/admin", { replace: true });
    if (isAnyDesigner(user)) return nav("/designer", { replace: true });
    nav("/", { replace: true });
  }, [user, state, nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cred = await signIn(email, pass);
      const u = cred?.user || { email }; 
      // preferencia: volver a donde venías
      if (isAdmin(u)) return nav("/admin", { replace: true });
      // 3) si es diseñador (digital o pattern) → /designer
      if (isAnyDesigner(u)) return nav("/designer", { replace: true });
      // sino, a home
      nav("/", { replace: true });
    } catch (err) {
      alert(err.message || "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ padding: 16, maxWidth: 400, margin: "0 auto" }}>
      <h1>Entrar</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="email"
          autoComplete="email"
        />
        <input
          type="password"
          value={pass}
          onChange={e=>setPass(e.target.value)}
          placeholder="password"
          autoComplete="current-password"
        />
        <button disabled={busy}>{busy ? "Entrando..." : "Entrar"}</button>
      </form>
    </section>
  );
}
