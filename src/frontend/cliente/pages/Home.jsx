// src/frontend/pages/Home.jsx
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const featureBlocks = [
    { id: 1, title: "Dibujo ➜ Peluche", desc: "Convierte un dibujo infantil en un juguete real paso a paso.", img: "https://placehold.co/1200x900?text=Imagen+1" },
    { id: 2, title: "Proceso guiado",   desc: "Sube el dibujo, completa preferencias y revisa el estado del pedido.", img: "https://placehold.co/1200x900?text=Imagen+2" },
    { id: 3, title: "Revisiones",       desc: "Habrá revisiones antes de la producción final para asegurar calidad.", img: "https://placehold.co/1200x900?text=Imagen+3" },
    { id: 4, title: "Entrega",          desc: "Recibe el peluche terminado con guía de rastreo.",                 img: "https://placehold.co/1200x900?text=Imagen+4" },
  ];

  // IntersectionObserver para revelar elementos al hacer scroll
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Parallax MUY sutil a las decoraciones del hero (nubes/burbujas)
  useEffect(() => {
    const cloud = document.querySelector(".hero .cloud");
    const bubble = document.querySelector(".hero .bubble");
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (cloud)  cloud.style.transform  = `translateY(${y * 0.06}px)`;
      if (bubble) bubble.style.transform = `translateY(${y * 0.04}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      {/* HERO: video full con texto encima (sin tarjeta) */}
      <section
        className="hero"
        style={{ minHeight: "100vh", position: "relative", overflow: "hidden", padding: 0 }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          src=""  /* TODO: coloca aquí tu mp4/webm cuando lo tengas */
          aria-label="Video de fondo"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", zIndex: 0
          }}
        />
        {/* Oscurecer un poco para legibilidad */}
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.25))"
          }}
        />

        {/* Decoraciones suaves del tema */}
        <div className="cloud" />
        <div className="bubble" />

        {/* Contenido del hero (centrado, sin card) */}
        <div
          className="container"
          style={{
            position: "relative", zIndex: 2, minHeight: "100vh",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff"
          }}
        >
          <h1 className="h1 wobble reveal" style={{ margin: 0 }}>
            Convierte sus dibujos en juguetes
          </h1>
          <p className="reveal" d-1 style={{ marginTop: 10, fontSize: 18, opacity: .95 }}>
            Sube un dibujo y empieza en segundos.
          </p>
          <div className="flex gap-4" style={{ marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/before" className="btn btn-primary btn-hero floaty reveal" d-2 aria-label="Ir a BeforeToyPhoto">
              Comienza creando tu juguete aquí
            </Link>
            <Link to="/signup" className="btn btn-secondary reveal" d-3>
              Registrarme
            </Link>
          </div>
        </div>
      </section>

      {/* TEXTO pantalla completa */}
      <section
        className="container reveal"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ maxWidth: 900, textAlign: "center" }}>
          <p style={{ fontSize: 22, lineHeight: 1.5 }}>
            “Estudios sugieren que el juego con juguetes estimula la creatividad, la resolución de problemas
            y fortalece el vínculo emocional entre niños y familia.”
          </p>
        </div>
      </section>

      {/* FEATURES alternados con reveal y pequeño “stagger” */}
      {featureBlocks.map((b, idx) => (
        <section
          key={b.id}
          className="container"
          style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
        >
          <div
            className="grid gap-8"
            style={{
              width: "100%", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "center"
            }}
          >
            <div style={{ order: idx % 2 === 0 ? 0 : 1 }}>
              <div className="reveal" d-1 style={{ overflow: "hidden", borderRadius: 20, border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                <img
                  src={b.img}
                  alt={b.title}
                  style={{ display: "block", width: "100%", height: 420, objectFit: "cover" }}
                />
              </div>
            </div>

            <div style={{ order: idx % 2 === 0 ? 1 : 0 }}>
              <h2 className="h2 reveal">{b.title}</h2>
              <p className="muted reveal" d-2 style={{ fontSize: 18 }}>{b.desc}</p>
            </div>
          </div>
        </section>
      ))}

      {/* CTA final sin tarjeta */}
      <section
        className="container reveal"
        style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}
      >
        <div>
          <h2 className="h2" style={{ marginTop: 0 }}>¿Listo para empezar?</h2>
          <p className="muted">Crea tu primer juguete en menos de 2 minutos.</p>
          <div className="flex gap-4" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/before" className="btn btn-primary btn-hero floaty">Comienza a crear ahora con un solo click</Link>
            <Link to="/signup" className="btn btn-secondary">Registrarme</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
