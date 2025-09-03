import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isAdmin, isAnyDesigner } from "../utils/roles.js";
import AuthLayout from "./designer/AuthLayout.jsx";

export default function SignUp() {
  const { signUp, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isAdmin(user)) return nav("/admin", { replace: true });
    if (isAnyDesigner(user)) return nav("/designer", { replace: true });
    nav("/", { replace: true });
  }, [user, nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cred = await signUp(email, pass);
      const u = cred?.user || { email };
      if (isAdmin(u)) return nav("/admin", { replace: true });
      if (isAnyDesigner(u)) return nav("/designer", { replace: true });
      nav("/", { replace: true });
    } catch (err) {
      alert(err.message || "No se pudo registrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Es rápido y podrás seguir el progreso de tu peluche."
      variant="plushies"
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#4b4f85" }}>Correo</span>
          <input
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tucorreo@email.com"
            autoComplete="email"
            style={{ fontSize: 16, padding: "12px 14px" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#4b4f85" }}>Contraseña</span>
          <input
            className="input"
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Mín. 6 caracteres"
            autoComplete="new-password"
            style={{ fontSize: 16, padding: "12px 14px" }}
          />
        </label>

        <button className="btn btn-primary" disabled={busy} style={{ padding: "12px 16px", fontSize: 16 }}>
          {busy ? "Creando..." : "Registrarme"}
        </button>

        <div className="muted" style={{ fontSize: 14 }}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="link">Inicia sesión</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
