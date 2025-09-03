// /src/frontend/designer/AuthLayout.jsx
import React from "react";

/**
 * AuthLayout animado:
 * - variant: "clouds" | "plushies"
 * - Fondo deslizante + flotantes + card con fade+scale
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  variant = "clouds",
}) {
  const bg = variant === "plushies" ? plushiesBG : cloudsBG;
  const FloatingShapes = variant === "plushies" ? PlushiesFloaters : CloudsFloaters;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background: "#F9FAFF",
      }}
    >
      <style>{css}</style>

      <header style={{ padding: "16px 20px" }}>
        <a href="/" className="brand" style={{ textDecoration: "none", fontWeight: 800, fontSize: 20, color: "#3A3F7A" }}>
          Draw2Toy
        </a>
      </header>

      <main
        style={{
          position: "relative",
          overflow: "hidden",
          padding: 24,
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* Capa 1: patrón SVG animado (deslizante) */}
        <div
          aria-hidden
          className="bg-slide"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: bg,
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
            opacity: 0.35,
            filter: "saturate(1.05)",
            zIndex: 0,
          }}
        />

        {/* Capa 2: flotantes (más piezas) */}
        <FloatingShapes />

        {/* Card con animación de entrada */}
        <div
          className="card auth-card pop-in"
          style={{
            width: "100%",
            maxWidth: 720,
            position: "relative",
            zIndex: 3,
            background: "white",
            border: "1px solid #E8EAF6",
            borderRadius: 24,
            boxShadow: "0 12px 40px rgba(28, 44, 90, 0.08)",
            padding: 32,
          }}
        >
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <h1 className="h1" style={{ margin: 0, fontSize: 40, lineHeight: 1.1 }}>
              {title}
            </h1>
            {subtitle ? (
              <p className="muted" style={{ margin: 0, fontSize: 16, color: "#556", opacity: 0.85 }}>
                {subtitle}
              </p>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 16 }}>{children}</div>
        </div>
      </main>

      <footer style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#7a7f9a" }}>
        © {new Date().getFullYear()} Draw2Toy — Hecho con cariño 🧸
      </footer>
    </div>
  );
}

/* ================= Animaciones y helpers CSS ================= */
const css = `
/* Fondo deslizante */
.bg-slide {
  animation: bgMove 40s linear infinite;
}
@keyframes bgMove {
  0% { background-position: 0 0; }
  100% { background-position: 260px 260px; }
}

/* Flotantes */
.floater {
  position: absolute;
  z-index: 1;
  opacity: 0.9;
  will-change: transform;
  animation: floatY 6.5s ease-in-out infinite;
  filter: drop-shadow(0 4px 10px rgba(20,30,60,.12));
}
.floater:nth-child(2) { animation-duration: 7.5s; animation-delay: .2s; }
.floater:nth-child(3) { animation-duration: 8.5s; animation-delay: .4s; }
.floater:nth-child(4) { animation-duration: 7.2s; animation-delay: .1s; }
.floater:nth-child(5) { animation-duration: 9s;   animation-delay: .6s; }
.floater:nth-child(6) { animation-duration: 8s;   animation-delay: .3s; }
.floater:nth-child(7) { animation-duration: 10s;  animation-delay: .5s; }

@keyframes floatY {
  0%   { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(10px, -16px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

/* Card: animación de entrada (fade + scale tipo spring) */
.pop-in {
  animation: popIn .6s cubic-bezier(.22,1,.36,1) both;
}
@keyframes popIn {
  0% { transform: scale(.96); opacity: 0; }
  60% { transform: scale(1.015); opacity: 1; }
  100% { transform: scale(1); }
}

/* Responsive tweak de flotantes */
@media (max-width: 640px) {
  .floater { transform-origin: center; }
}
`;

/* ================= Capa de flotantes: Clouds (más nubes) ================= */
function CloudsFloaters() {
  return (
    <div aria-hidden>
      <div className="floater" style={{ top: 30, left: 30 }}>
        <Cloud width={120} fill="#FFFFFF" stroke="#D8E2FF" />
      </div>
      <div className="floater" style={{ top: 100, right: 40 }}>
        <Cloud width={150} fill="#FFFFFF" stroke="#E7ECFF" />
      </div>
      <div className="floater" style={{ bottom: 70, left: 70 }}>
        <Cloud width={110} fill="#FFFFFF" stroke="#E3E9FF" />
      </div>
      <div className="floater" style={{ bottom: 140, right: 120 }}>
        <Cloud width={140} fill="#FFFFFF" stroke="#DDE6FF" />
      </div>
      <div className="floater" style={{ top: 220, left: "45%" }}>
        <Cloud width={100} fill="#FFFFFF" stroke="#E6EAFF" />
      </div>
      <div className="floater" style={{ bottom: 30, right: 30 }}>
        <Cloud width={90} fill="#FFFFFF" stroke="#E6EAFF" />
      </div>
      <div className="floater" style={{ top: 160, left: 140 }}>
        <Cloud width={130} fill="#FFFFFF" stroke="#DCE4FF" />
      </div>
    </div>
  );
}

/* ================= Capa de flotantes: Plushies (más ositos) ================= */
function PlushiesFloaters() {
  return (
    <div aria-hidden>
      <div className="floater" style={{ top: 40, left: 50 }}>
        <BearFace size={95} color="#FFC8DD" />
      </div>
      <div className="floater" style={{ top: 120, right: 60 }}>
        <BearFace size={110} color="#BDE0FE" />
      </div>
      <div className="floater" style={{ bottom: 90, left: 90 }}>
        <BearFace size={100} color="#CDEAC0" />
      </div>
      <div className="floater" style={{ bottom: 140, right: 120 }}>
        <BearFace size={120} color="#FFDFBA" />
      </div>
      <div className="floater" style={{ top: 200, left: "45%" }}>
        <BearFace size={88} color="#EAD1FF" />
      </div>
      <div className="floater" style={{ bottom: 40, right: 40 }}>
        <BearFace size={90} color="#FFE6A7" />
      </div>
      <div className="floater" style={{ top: 70, left: 180 }}>
        <BearFace size={105} color="#A7F3D0" />
      </div>
    </div>
  );
}

/* ================= SVG helpers ================= */
function Cloud({ width = 120, fill = "#fff", stroke = "#E8EEFF" }) {
  const h = Math.round(width * 0.6);
  return (
    <svg width={width} height={h} viewBox="0 0 200 120" fill="none">
      <path
        d="M48 84c-20 0-36-13-36-30s16-30 36-30c9 0 18 3 24 8 7-16 24-28 44-28 26 0 48 18 48 40 12 2 22 12 22 24 0 14-13 26-30 26H48Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="3"
      />
    </svg>
  );
}

function BearFace({ size = 100, color = "#FFC8DD" }) {
  const ear = Math.round(size * 0.18);
  const face = Math.round(size * 0.38);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="30" cy="28" r={ear} fill={color} />
      <circle cx="70" cy="28" r={ear} fill={color} />
      <circle cx="50" cy="50" r={face} fill={color} />
      <circle cx="43" cy="48" r="3" fill="#333" />
      <circle cx="57" cy="48" r="3" fill="#333" />
      <path d="M42 58 Q50 64 58 58" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ================= Fondos SVG (data-URIs) ================= */

/* Nubes (Login) */
const cloudsBG = `url("data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'>
  <defs>
    <radialGradient id='g' cx='50%%' cy='50%%' r='80%%'>
      <stop offset='0%%' stop-color='%23FFFFFF' stop-opacity='0.9'/>
      <stop offset='100%%' stop-color='%23DDE3FF' stop-opacity='0.2'/>
    </radialGradient>
  </defs>
  <rect width='260' height='260' fill='%23F2F5FF'/>
  <g fill='url(%23g)'>
    <circle cx='40' cy='40' r='40'/>
    <circle cx='200' cy='60' r='50'/>
    <circle cx='120' cy='140' r='60'/>
    <circle cx='60' cy='210' r='45'/>
  </g>
</svg>")`;

/* Peluches (SignUp) */
const plushiesBG = `url("data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'>
  <rect width='260' height='260' fill='%23FFF7FB'/>
  <g fill='%23FFD9EC' opacity='0.8'>
    <circle cx='40' cy='50' r='26'/>
    <circle cx='210' cy='70' r='22'/>
    <circle cx='150' cy='180' r='28'/>
    <circle cx='85' cy='210' r='20'/>
  </g>
  <g opacity='0.85'>
    <g transform='translate(20,20) scale(0.9)'>
      <circle cx='30' cy='30' r='20' fill='%23FFC8DD'/>
      <circle cx='20' cy='22' r='6' fill='%23FFC8DD'/>
      <circle cx='40' cy='22' r='6' fill='%23FFC8DD'/>
      <circle cx='25' cy='30' r='2' fill='%23333'/>
      <circle cx='35' cy='30' r='2' fill='%23333'/>
      <path d='M25 36 Q30 41 35 36' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'/>
    </g>
    <g transform='translate(160,30) scale(1.05)'>
      <circle cx='30' cy='30' r='20' fill='%23BDE0FE'/>
      <circle cx='20' cy='22' r='6' fill='%23BDE0FE'/>
      <circle cx='40' cy='22' r='6' fill='%23BDE0FE'/>
      <circle cx='25' cy='30' r='2' fill='%23333'/>
      <circle cx='35' cy='30' r='2' fill='%23333'/>
      <path d='M25 36 Q30 41 35 36' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'/>
    </g>
    <g transform='translate(110,150) scale(1.0)'>
      <circle cx='30' cy='30' r='20' fill='%23CDEAC0'/>
      <circle cx='20' cy='22' r='6' fill='%23CDEAC0'/>
      <circle cx='40' cy='22' r='6' fill='%23CDEAC0'/>
      <circle cx='25' cy='30' r='2' fill='%23333'/>
      <circle cx='35' cy='30' r='2' fill='%23333'/>
      <path d='M25 36 Q30 41 35 36' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'/>
    </g>
  </g>
</svg>")`;
