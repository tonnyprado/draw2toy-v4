// src/frontend/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../../../context/CartContext.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { isAdmin } from "../../../utils/roles.js";

// Animaciones del menú + BLUNDY arcoíris
import "../../../ui-design/motion/nav-animations.css";
// Estilos del modal de auth
import "../../../ui-design/motion/modal-auth.css";

export default function Navbar() {
  const { count } = useCart();

  const auth = (typeof useAuth === "function") ? useAuth() : null;
  const user = auth?.user;
  const logout = auth?.logout;

  const amAdmin = isAdmin(user);

  const [open, setOpen] = useState(false);         // overlay del menú
  const [closing, setClosing] = useState(false);   // salida animada del menú
  const [authOpen, setAuthOpen] = useState(false); // modal auth

  const nav = useNavigate();
  const overlayRef = useRef(null);
  const isActive = open || closing;

  const go = (path) => { startClose(); nav(path); };
  const goStatusPrompt = () => {
    const id = prompt("Ingresa tu número de ticket:");
    if (id) { startClose(); nav(`/status/${id}`); }
  };

  const startOpen  = () => { setOpen(true); setClosing(false); };
  const startClose = () => { setClosing(true); };

  // 🔹 Clase global para evitar bugs de transform/stacking
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const anyOpen = isActive || authOpen;
    if (anyOpen) { html.classList.add("menu-open"); body.classList.add("menu-open"); }
    else { html.classList.remove("menu-open"); body.classList.remove("menu-open"); }
    return () => { html.classList.remove("menu-open"); body.classList.remove("menu-open"); };
  }, [isActive, authOpen]);

  // desmontar overlay cuando termine la animación de salida
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const onAnimEnd = (e) => {
      if (e.target.classList.contains("overlay") && closing) {
        setOpen(false);
        setClosing(false);
      }
    };
    el.addEventListener("animationend", onAnimEnd);
    return () => el.removeEventListener("animationend", onAnimEnd);
  }, [closing]);

  // ESC: cierra overlay o modal si están abiertos
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (authOpen) setAuthOpen(false);
      else if (open) startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, authOpen]);

  // bloquear scroll del body cuando hay overlay o modal
  useEffect(() => {
    const prev = document.body.style.overflow;
    const anyOpen = open || closing || authOpen;
    document.body.style.overflow = anyOpen ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [open, closing, authOpen]);

  // Foco inicial dentro del modal
  const firstAuthBtnRef = useRef(null);
  useEffect(() => {
    if (authOpen) setTimeout(() => firstAuthBtnRef.current?.focus(), 0);
  }, [authOpen]);

  // === Overlays mediante Portal (montados en <body>) ===
  const overlayPortal = (open || closing) ? createPortal(
    <div
      ref={overlayRef}
      className={`overlay ${closing ? "wipe-out" : "wipe-in"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      onClick={(e) => { if (e.target === e.currentTarget) startClose(); }}
      // centrado y siempre por delante del video/canvas del Home
      style={{ zIndex: 1000, justifyContent: "center", alignItems: "center" }}
    >
      {/* Fondo animado — debajo del panel */}
      <div
        className="overlay-bg"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <span className="plush p1" />
        <span className="plush p2" />
        <span className="plush p3" />
        <span className="plush p4" />
        <span className="plush p5" />
        <span className="plush p6" />
      </div>

      {/* X cerrar al frente */}
      <button
        aria-label="Cerrar menú"
        onClick={startClose}
        className="overlay-close"
        style={{ zIndex: 3, position: "absolute" }}
      >
        ×
      </button>

      {/* Panel: SIN “card”, usa tu CSS existente */}
      <nav
        className={`menu menu-panel ${closing ? "closing" : "entering"}`}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", zIndex: 2 }}
      >
        <ul className="menu-list">
          <li className={`menu-item ${closing ? "out" : "in"}`} style={{ "--i": "1" }}>
            <button className="menu-btn" onClick={() => go("/toy-photo")}>Crea tu Peluche</button>
          </li>
          <li className={`menu-item ${closing ? "out" : "in"}`} style={{ "--i": "2" }}>
            <button className="menu-btn" onClick={goStatusPrompt}>Seguimiento de Pedidos</button>
          </li>
          <li className={`menu-item ${closing ? "out" : "in"}`} style={{ "--i": "3" }}>
            <button className="menu-btn" onClick={() => go("/before")}>Acerca de</button>
          </li>
          <li className={`menu-item ${closing ? "out" : "in"}`} style={{ "--i": "4" }}>
            <button className="menu-btn" onClick={() => go("/contact")}>Contacto</button>
          </li>

          {amAdmin && (
            <li className={`menu-item ${closing ? "out" : "in"}`} style={{ "--i": "5" }}>
              <button className="menu-btn" onClick={() => go("/admin")}>Panel de administrador</button>
            </li>
          )}

          {user && (
            <li className={`menu-item ${closing ? "out" : "in"}`} style={{ "--i": "6" }}>
              <button className="menu-btn" onClick={() => { logout?.(); startClose(); }}>Logout</button>
            </li>
          )}
        </ul>
      </nav>
    </div>,
    document.body
  ) : null;

  const authPortal = authOpen ? createPortal(
    <div
      className="auth-overlay fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Opciones de acceso"
      onClick={(e) => { if (e.target === e.currentTarget) setAuthOpen(false); }}
      style={{ zIndex: 1100 }} // por encima del overlay del menú
    >
      <div className="auth-modal pop-in" role="document">
        <button
          className="auth-close"
          aria-label="Cerrar"
          onClick={() => setAuthOpen(false)}
        >×</button>

        <h3 className="auth-title">Bienvenido/a</h3>
        <p className="auth-text">Elige una opción para continuar</p>

        <div className="auth-actions">
          <Link
            to="/login"
            className="auth-btn auth-primary"
            onClick={() => setAuthOpen(false)}
            ref={firstAuthBtnRef}
          >
            <DoorInIcon />
            Entrar
          </Link>

          <Link
            to="/signup"
            className="auth-btn auth-secondary"
            onClick={() => setAuthOpen(false)}
          >
            <SparkleIcon />
            Registrarme
          </Link>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Barra superior — efecto glass */}
      <header
        className={`sticky top-0 z-50 h-16 border-b shadow-sm
                    bg-base-100/80 backdrop-blur supports-[backdrop-filter]:bg-base-100/70
                    ${isActive ? "menu-open" : ""}`}
        style={{ WebkitBackdropFilter: "blur(10px)" }} // soporte iOS
      >
        <div className="container navbar-inner h-full flex items-center justify-between">
          {/* Izquierda: hamburguesa */}
          <div className="flex items-center" style={{ flex: "0 0 auto" }}>
            <button
              type="button"
              aria-label={isActive ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isActive}
              onClick={() => (isActive ? startClose() : startOpen())}
              className={`hamburger ${isActive ? "is-active" : ""}`}
            >
              <span className="line" />
              <span className="line" />
              <span className="line" />
            </button>
          </div>

          {/* Centro: Marca BLUNDY arcoíris con brinquito */}
          <div className="flex items-center" style={{ flex: "1 1 auto", justifyContent: "center" }}>
            <Link to="/" className="brand blundy-logo" aria-label="Inicio BLUNDY">
              <span className="b">B</span>
              <span className="l">L</span>
              <span className="u">U</span>
              <span className="n">N</span>
              <span className="d">D</span>
              <span className="y">Y</span>
            </Link>
          </div>

          {/* Derecha: iconos */}
          <div className="flex items-center" style={{ flex: "0 0 auto", gap: 12 }}>
            {/* Ícono carrito */}
            <Link to="/checkout" className="icon-btn" aria-label={`Carrito (${count})`}>
              <CartIcon />
              {count > 0 && <span className="badge-dot" aria-hidden="true">{count}</span>}
            </Link>

            {/* Ícono usuario / logout */}
            {user ? (
              <>
                <span className="user-email" style={{ marginLeft: 6, opacity: 0.9 }}>
                  {user.email}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Cerrar sesión"
                  onClick={() => logout?.()}
                  title="Logout"
                >
                  <LogoutIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="icon-btn"
                aria-haspopup="dialog"
                aria-expanded={authOpen}
                aria-label="Abrir opciones de acceso"
                onClick={() => setAuthOpen(true)}
                title="Entrar / Registrarme"
              >
                <UserIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Portales */}
      {overlayPortal}
      {authPortal}
    </>
  );
}

/* ====== Íconos SVG ====== */
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6L5 3H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="19.5" r="1.6" fill="currentColor"/>
      <circle cx="17" cy="19.5" r="1.6" fill="currentColor"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function DoorInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 4h6a1 1 0 011 1v14a1 1 0 01-1 1h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
