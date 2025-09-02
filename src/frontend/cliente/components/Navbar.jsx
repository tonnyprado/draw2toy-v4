// src/frontend/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext.jsx";      // deja tus paths tal como los tienes
import { useAuth } from "../../../context/AuthContext.jsx";      // (si te funcionan, no los muevas)
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
      {/* Barra superior */}
      <header className="navbar">
        <div className="container navbar-inner">
          <button
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="hamburger"
          >
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </button>

          <Link to="/" className="brand">draw2toy</Link>

          <div className="flex items-center" style={{ marginLeft: "auto", gap: 12 }}>
            <Link to="/checkout" className="btn">Carrito ({count})</Link>
            {user ? (
              <span style={{ marginLeft: 12, opacity: 0.9 }}>{user.email}</span>
            ) : (
              <>
                <Link to="/login" className="btn" style={{ marginLeft: 12 }}>Entrar</Link>
                <Link to="/signup" className="btn btn-primary" style={{ marginLeft: 12 }}>Registrarme</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Overlay de menú */}
      {open && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}   /* cerrar si clicas fuera del menú */
        >
          {/* Botón "X" fijo */}
          <button
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="overlay-close"
          >
            ×
          </button>

          {/* Menú centrado (detenemos la propagación para no cerrar) */}
          <nav className="menu" onClick={(e) => e.stopPropagation()}>
            <ul className="menu-list">
              <li>
                <button className="menu-btn" onClick={() => go("/toy-photo")}>
                  Crea tu Peluche
                </button>
              </li>
              <li>
                <button className="menu-btn" onClick={goStatusPrompt}>
                  Seguimiento de Pedidos
                </button>
              </li>
              <li>
                <button className="menu-btn" onClick={() => go("/before")}>
                  Acerca de
                </button>
              </li>
              <li>
                <button className="menu-btn" onClick={() => go("/contact")}>
                  Contacto
                </button>
              </li>

              {amAdmin && (
                <li>
                  <button className="menu-btn" onClick={() => go("/admin")}>
                    Panel de administrador
                  </button>
                </li>
              )}

              {user && (
                <li>
                  <button
                    className="menu-btn"
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
