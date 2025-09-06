import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../../../context/CartContext.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { isAdmin } from "../../../utils/roles.js";

import "../../../ui-design/motion/nav-animations.css";
import "../../../ui-design/motion/modal-auth.css";

/* IMÁGENES */
import BrandImg from "../../../assets/BLUNDY_ART/BLUNDY_SOLO_VECTORIZED.PNG";
import BgImg from "../../../assets/BLUNDY_ART/IMG_0919.jpg";

export default function Navbar() {
  const { count } = useCart();
  const auth = (typeof useAuth === "function") ? useAuth() : null;
  const user = auth?.user;
  const logout = auth?.logout;
  const amAdmin = isAdmin(user);

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const nav = useNavigate();
  const overlayRef = useRef(null);
  const closeTimer = useRef(0);

  const startOpen = () => { setOpen(true); setClosing(false); };
  const startClose = () => {
    setClosing(true);
    clearTimeout(closeTimer.current);
    // cierre rápido para que no se “trabe”
    closeTimer.current = setTimeout(() => { setOpen(false); setClosing(false); }, 520);
  };

  // evita stacking bugs
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const anyOpen = open || closing || authOpen;
    if (anyOpen) { html.classList.add("menu-open"); body.classList.add("menu-open"); }
    else { html.classList.remove("menu-open"); body.classList.remove("menu-open"); }
    return () => { html.classList.remove("menu-open"); body.classList.remove("menu-open"); };
  }, [open, closing, authOpen]);

  // ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (authOpen) setAuthOpen(false);
      else if (open) startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, authOpen]);

  // bloquear scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    const anyOpen = open || closing || authOpen;
    document.body.style.overflow = anyOpen ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [open, closing, authOpen]);

  // fallback animationend
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const onAnimEnd = () => { if (closing) { setOpen(false); setClosing(false); } };
    el.addEventListener("animationend", onAnimEnd);
    return () => el.removeEventListener("animationend", onAnimEnd);
  }, [closing]);

  // === OVERLAY ===
  const overlayPortal = (open || closing) ? createPortal(
    <div
      ref={overlayRef}
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      onClick={(e) => { if (e.target === e.currentTarget) startClose(); }}
      style={{ zIndex: 2000, "--overlay-delay": "1.1s" }}
    >
      <div className={`overlay-iris ${closing ? "reveal-out" : "reveal-in"}`} style={{ "--rx": "0%", "--ry": "0%" }}>
        {/* Fondo */}
        <div
          className="overlay-bg"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${BgImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="overlay-tint" />
          <div className="overlay-spiral" />
        </div>

        <button
          aria-label="Cerrar menú"
          onClick={startClose}
          className="overlay-close ghost-x"
          style={{ zIndex: 3, position: "absolute" }}
        >×</button>

        {/* Panel + opciones */}
        <nav
          className={`menu menu-panel ${closing ? "closing" : "entering"}`}
          onClick={(e) => e.stopPropagation()}
          style={{ position: "relative", zIndex: 2 }}
        >
          <ul className="menu-list letters-only">
            <li className="menu-item in" style={{ "--i": "1" }}>
              <button className="menu-link" onClick={() => { startClose(); nav("/toy-photo"); }}>
                CREA TU PELUCHE
              </button>
            </li>
            <li className="menu-item in" style={{ "--i": "2" }}>
              <button className="menu-link" onClick={() => {
                const id = prompt("Ingresa tu número de ticket:");
                if (id) { startClose(); nav(`/status/${id}`); }
              }}>
                SEGUIMIENTO DE PEDIDOS
              </button>
            </li>
            <li className="menu-item in" style={{ "--i": "3" }}>
              <button className="menu-link" onClick={() => { startClose(); nav("/before"); }}>
                ACERCA DE
              </button>
            </li>
            <li className="menu-item in" style={{ "--i": "4" }}>
              <button className="menu-link" onClick={() => { startClose(); nav("/contact"); }}>
                CONTACTO
              </button>
            </li>
            {amAdmin && (
              <li className="menu-item in" style={{ "--i": "5" }}>
                <button className="menu-link" onClick={() => { startClose(); nav("/admin"); }}>
                  ADMIN
                </button>
              </li>
            )}
            {user && (
              <li className="menu-item in" style={{ "--i": "6" }}>
                <button className="menu-link" onClick={() => { logout?.(); startClose(); }}>
                  LOGOUT
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>,
    document.body
  ) : null;

  // === MODAL AUTH ===
  const authPortal = authOpen ? createPortal(
    <div
      className="auth-overlay fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Opciones de acceso"
      onClick={(e) => { if (e.target === e.currentTarget) setAuthOpen(false); }}
      style={{ zIndex: 2100 }}
    >
      <div className="auth-modal pop-in" role="document">
        <button className="auth-close" aria-label="Cerrar" onClick={() => setAuthOpen(false)}>×</button>
        <h3 className="auth-title">Bienvenido/a</h3>
        <p className="auth-text">Elige una opción para continuar</p>
        <div className="auth-actions">
          <Link to="/login" className="auth-btn auth-primary" onClick={() => setAuthOpen(false)}>
            <DoorInIcon /> Entrar
          </Link>
          <Link to="/signup" className="auth-btn auth-secondary" onClick={() => setAuthOpen(false)}>
            <SparkleIcon /> Registrarme
          </Link>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const isActive = open || closing;

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b shadow-sm bg-base-100/80 backdrop-blur"
        style={{ WebkitBackdropFilter: "blur(10px)" }}
      >
        <div
          className="navbar-inner"
          style={{
            margin: "0 auto",
            maxWidth: "1200px",
            padding: "0 12px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            height: "72px"
          }}
        >
          {/* IZQ: Cruz rotatoria */}
          <div style={{ justifySelf: "start" }}>
            <button
              type="button"
              aria-label={isActive ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isActive}
              onClick={() => (isActive ? startClose() : startOpen())}
              className={`cross-rotor ${isActive ? "is-active" : ""}`}
              title="Menú"
            >
              <span className="bar" />
            </button>
          </div>

          {/* CENTRO: Logo */}
          <div style={{ justifySelf: "center" }}>
            <Link to="/" aria-label="Inicio Draw2Toy" className="brand-link">
              <img
                src={BrandImg}
                alt="Draw2Toy"
                className="brand-img"
                style={{ height: "48px", width: "auto", display: "block" }}
              />
            </Link>
          </div>

          {/* DER: Iconos */}
          <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: "10px" }}>
            <Link to="/checkout" className="icon-ghost" aria-label={`Carrito (${count})`}>
              <CartIcon />
              {count > 0 && <span className="badge-dot">{count}</span>}
            </Link>

            {user ? (
              <>
                <span className="user-email" style={{ fontSize: 13 }}>{user.email}</span>
                <button type="button" className="icon-ghost" onClick={() => logout?.()} title="Logout">
                  <LogoutIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="icon-ghost"
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

      {overlayPortal}
      {authPortal}
    </>
  );
}

/* ===== Íconos SVG con degradado + textura crayola ===== */
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="crayola-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C63FF"/><stop offset="100%" stopColor="#FF6B6B"/>
        </linearGradient>
        <filter id="crayon-texture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6"/>
        </filter>
        <style>{`.crayola{stroke:url(#crayola-gradient);filter:url(#crayon-texture);}`}</style>
      </defs>
      <path className="crayola" d="M6 6h15l-1.5 9h-12L6 6Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="crayola" d="M6 6L5 3H2" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="19.5" r="1.6" fill="url(#crayola-gradient)"/>
      <circle cx="17" cy="19.5" r="1.6" fill="url(#crayola-gradient)"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="crayola-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C63FF"/><stop offset="100%" stopColor="#FF6B6B"/>
        </linearGradient>
        <filter id="crayon-texture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6"/>
        </filter>
        <style>{`.crayola{stroke:url(#crayola-gradient);filter:url(#crayon-texture);}`}</style>
      </defs>
      <circle className="crayola" cx="12" cy="8" r="4" strokeWidth="1.8"/>
      <path className="crayola" d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="crayola-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C63FF"/><stop offset="100%" stopColor="#FF6B6B"/>
        </linearGradient>
        <filter id="crayon-texture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6"/>
        </filter>
        <style>{`.crayola{stroke:url(#crayola-gradient);filter:url(#crayon-texture);}`}</style>
      </defs>
      <path className="crayola" d="M15 12H3" strokeWidth="1.8" strokeLinecap="round"/>
      <path className="crayola" d="M11 8l-4 4 4 4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="crayola" d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" strokeWidth="1.8" strokeLinecap="round"/>
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
