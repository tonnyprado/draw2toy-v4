// src/frontend/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  // Placeholder de bloques “imagen + texto”
  const featureBlocks = [
    {
      id: 1,
      title: "Dibujo ➜ Peluche",
      desc: "Convierte un dibujo infantil en un juguete real paso a paso.",
      img: "https://placehold.co/800x600?text=Imagen+1", // TODO: reemplazar
    },
    {
      id: 2,
      title: "Proceso guiado",
      desc: "Sube el dibujo, completa preferencias y revisa el estado del pedido.",
      img: "https://placehold.co/800x600?text=Imagen+2",
    },
    {
      id: 3,
      title: "Revisiones",
      desc: "Habrá revisiones antes de la producción final para asegurar calidad.",
      img: "https://placehold.co/800x600?text=Imagen+3",
    },
    {
      id: 4,
      title: "Entrega",
      desc: "Recibe el peluche terminado con guía de rastreo.",
      img: "https://placehold.co/800x600?text=Imagen+4",
    },
  ];

  return (
    <div>
      {/* Sección 1: Hero con video de fondo + CTA */}
      <section style={styles.hero}>
        {/* VIDEO de fondo (reemplaza el src cuando tengas el archivo/URL) */}
        <video
          style={styles.video}
          autoPlay
          loop
          muted
          playsInline
          // TODO: reemplazar por tu video (mp4/webm). Si no tienes aún, deja el <video> sin src.
          src=""
        />
        {/* Overlay para legibilidad (sin diseño, solo un fondo suave) */}
        <div style={styles.overlay} />

        <div style={styles.heroContent}>
          <h1 style={styles.h1}>Convierte sus dibujos en juguetes</h1>
          <p style={styles.p}>Sube un dibujo y empieza en segundos.</p>
          <Link to="/before" style={styles.primaryBtn} aria-label="Ir a BeforeToyPhoto">
            Comienza creando tu juguete aquí
          </Link>
        </div>
      </section>

      {/* Sección 2: Texto completo en pantalla */}
      <section style={styles.fullScreenSection}>
        <div style={styles.centerCol}>
          <p style={{ fontSize: 20, maxWidth: 800, textAlign: "center", lineHeight: 1.5 }}>
            “Estudios sugieren que el juego con juguetes estimula la creatividad, la resolución de problemas
            y fortalece el vínculo emocional entre niños y familia.”
          </p>
        </div>
      </section>

      {/* Sección 3: Bloques alternados imagen/descripcion (4 pantallas) */}
      {featureBlocks.map((b, idx) => (
        <section key={b.id} style={styles.featureSection}>
          <div
            style={{
              ...styles.featureRow,
              flexDirection: idx % 2 === 0 ? "row" : "row-reverse",
            }}
          >
            <div style={styles.featureMedia}>
              {/* Imagen placeholder, reemplaza por tus assets cuando quieras */}
              <img
                src={b.img}
                alt={b.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={styles.featureText}>
              <h2 style={styles.h2}>{b.title}</h2>
              <p style={styles.p}>{b.desc}</p>
            </div>
          </div>
        </section>
      ))}

      {/* Sección 4: CTA final */}
      <section style={styles.finalSection}>
        <div style={styles.centerCol}>
          <h2 style={styles.h2}>¿Listo para empezar?</h2>
          <p style={styles.p}>Crea tu primer juguete en menos de 2 minutos.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/before" style={styles.primaryBtn}>
              Comienza a crear ahora con un solo click
            </Link>
            <Link to="/signup" style={styles.secondaryBtn}>
              Registrarme
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    position: "relative",
    height: "100vh",
    overflow: "hidden",
    background: "#000",
  },
  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.25)", // suaviza para lectura
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    color: "#fff",
    textAlign: "center",
  },
  h1: { fontSize: 34, margin: 0 },
  h2: { fontSize: 28, margin: "0 0 8px 0" },
  p: { margin: 0, opacity: 0.9 },
  primaryBtn: {
    display: "inline-block",
    padding: "10px 16px",
    border: "1px solid #222",
    background: "#fff",
    color: "#111",
    textDecoration: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "10px 16px",
    border: "1px solid #999",
    background: "#f5f5f5",
    color: "#222",
    textDecoration: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  fullScreenSection: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  centerCol: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  featureSection: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: 24,
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    flexWrap: "wrap", // stackea en pantallas pequeñas
  },
  featureMedia: {
    flex: "1 1 420px",
    minWidth: 320,
    height: 320,
    background: "#e9e9e9",
    overflow: "hidden",
  },
  featureText: {
    flex: "1 1 420px",
    minWidth: 320,
  },

  finalSection: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderTop: "1px solid #eee",
  },
};
