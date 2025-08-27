import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

import { isAdmin } from "../../../utils/roles.js";

export default function Navbar() {

  
  const { count } = useCart();
  const auth = (typeof useAuth === "function") ? useAuth() : null;
  const user = auth?.user;
  const logout = auth?.logout;
  
  const amAdmin = isAdmin(user);  
  
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const go = (path) => { setOpen(false); nav(path); };
  const goStatusPrompt = () => {
    const id = prompt("Ingresa tu número de ticket:");
    if (id) { setOpen(false); nav(`/status/${id}`); }
  };

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header style={styles.bar}>
        <button aria-label="Abrir menú" onClick={() => setOpen(true)} style={styles.hamburger}>
          <span style={styles.line} />
          <span style={styles.line} />
          <span style={styles.line} />
        </button>

        <Link to="/" style={styles.brand}>draw2toy</Link>

        <div style={styles.right}>
          <Link to="/checkout">Carrito ({count})</Link>
          {user ? (
            <span style={{ marginLeft: 12, opacity: 0.9 }}>{user.email}</span>
          ) : (
            <>
              <Link to="/login" style={{ marginLeft: 12 }}>Entrar</Link>
              <Link to="/signup" style={{ marginLeft: 12 }}>Registrarme</Link>
            </>
          )}
        </div>
      </header>

      {open && (
        <div
          style={styles.overlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}            // cerrar si clicas fuera del menú
        >
          {/* Botón "X" fijo en la esquina de la pantalla */}
          <button
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            style={styles.overlayClose}
          >
            ×
          </button>

          {/* Menú centrado. Detenemos la propagación para que no cierre al hacer click dentro */}
          <nav style={styles.menu} onClick={(e) => e.stopPropagation()}>
            <ul style={styles.list}>
              <li><button style={styles.itemBtn} onClick={() => go("/toy-photo")}>Crea tu Peluche</button></li>
              <li><button style={styles.itemBtn} onClick={goStatusPrompt}>Seguimiento de Pedidos</button></li>
              <li><button style={styles.itemBtn} onClick={() => go("/before")}>Acerca de</button></li>
              <li><button style={styles.itemBtn} onClick={() => go("/contact")}>Contacto</button></li>
              {amAdmin && (
                <li>
                    <button style={styles.itemBtn} onClick={() => go("/admin")}>
                        Panel de administrador
                    </button>
                </li>
              )}
              {user && (
                <li>
                  <button
                    style={styles.itemBtn}
                    onClick={() => { logout?.(); setOpen(false); }}
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

const styles = {
  bar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    background: "#fff",
    borderBottom: "1px solid #eee",
    height: 56,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 12px",
  },
  hamburger: {
    width: 36, height: 36,
    display: "grid", placeItems: "center",
    border: "1px solid #ddd", background: "#fff", borderRadius: 6, cursor: "pointer",
  },
  line: { width: 16, height: 2, background: "#333", display: "block", margin: "2px 0" },
  brand: { textDecoration: "none", color: "#111", fontWeight: 700, fontSize: 16 },
  right: { marginLeft: "auto", display: "flex", alignItems: "center" },

  overlay: {
    position: "fixed", inset: 0, background: "#ffffff", zIndex: 40,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  overlayClose: {
    position: "fixed", top: 12, right: 12,
    width: 40, height: 40,
    border: "1px solid #ddd", borderRadius: 8,
    background: "#fff", cursor: "pointer",
    fontSize: 28, lineHeight: "36px",
  },
  menu: { width: "100%", maxWidth: 720, textAlign: "center" },
  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 18 },
  itemBtn: {
    width: "100%", padding: "16px 12px",
    fontSize: 22, border: "1px solid #ddd", background: "#fff", borderRadius: 10,
    cursor: "pointer",
  },
};
