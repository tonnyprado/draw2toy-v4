// src/frontend/pages/BeforeToyPhoto.jsx
import { Link } from "react-router-dom";

export default function BeforeToyPhoto() {
  const steps = [
    { id: 1, title: "Sube tu dibujo", desc: "Toma una foto clara del dibujo original." },
    { id: 2, title: "Elige detalles", desc: "Indica tamaño, colores y cualquier preferencia." },
    { id: 3, title: "Revisión y pago", desc: "Confirma el boceto digital y procede al pago." },
    { id: 4, title: "Producción y envío", desc: "Fabricamos el juguete y lo enviamos con guía de rastreo." },
  ];

  const gallery = [
    { id: 1, src: "https://placehold.co/800x600?text=Foto+1", caption: "Ejemplo 1" },
    { id: 2, src: "https://placehold.co/800x600?text=Foto+2", caption: "Ejemplo 2" },
    { id: 3, src: "https://placehold.co/800x600?text=Foto+3", caption: "Ejemplo 3" },
    { id: 4, src: "https://placehold.co/800x600?text=Foto+4", caption: "Ejemplo 4" },
    { id: 5, src: "https://placehold.co/800x600?text=Foto+5", caption: "Ejemplo 5" },
    { id: 6, src: "https://placehold.co/800x600?text=Foto+6", caption: "Ejemplo 6" },
  ];

  const priceRows = [
    { plan: "Básico", incluye: "Tamaño chico, 1 revisión", precio: "TBD", tiempo: "TBD" },
    { plan: "Premium", incluye: "Tamaño mediano, 2 revisiones", precio: "TBD", tiempo: "TBD" },
    { plan: "XL", incluye: "Tamaño grande, 2 revisiones", precio: "TBD", tiempo: "TBD" },
  ];

  return (
    <div>
      {/* Hero / CTA inicial */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.h1}>¿Cómo funciona?</h1>
          <p style={styles.p}>Conoce el proceso antes de empezar y mira ejemplos reales.</p>
          <Link to="/toy-photo" style={styles.primaryBtn}>
            Crear juguete
          </Link>
        </div>
      </section>

      {/* Pasos */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Pasos del proceso</h2>
        <ol style={styles.steps}>
          {steps.map(s => (
            <li key={s.id} style={styles.stepItem}>
              <div style={styles.stepNum}>{s.id}</div>
              <div>
                <div style={styles.stepTitle}>{s.title}</div>
                <div style={styles.stepDesc}>{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Video "Cómo se hacen" */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Cómo se hacen</h2>
        <div style={styles.videoBox}>
          {/* Placeholder de video: reemplaza el src o usa <iframe> si es Youtube/Vimeo */}
          <video
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            src=""
            controls
            muted
          />
        </div>
        <p style={styles.pSmall}>
          Aquí irá un video corto mostrando el proceso de elaboración (corte, costura, ensamblado).
        </p>
      </section>

      {/* Galería */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Galería</h2>
        <div style={styles.grid}>
          {gallery.map(g => (
            <figure key={g.id} style={styles.card}>
              <img
                src={g.src}
                alt={g.caption}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
              <figcaption style={styles.caption}>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Lista de precios (TBD) */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Lista de precios (referencial)</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Incluye</th>
                <th style={styles.th}>Desde</th>
                <th style={styles.th}>Tiempo estimado</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>{r.plan}</td>
                  <td style={styles.td}>{r.incluye}</td>
                  <td style={styles.td}>{r.precio}</td>
                  <td style={styles.td}>{r.tiempo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={styles.pSmall}>
          * Los valores son demostrativos. Ajustaremos precios y tiempos reales con tu OK.
        </p>
      </section>

      {/* CTA final */}
      <section style={styles.finalCta}>
        <div style={{ textAlign: "center" }}>
          <h2 style={styles.h2}>¿Listo para convertir un dibujo en un recuerdo?</h2>
          <p style={styles.p}>Empieza ahora mismo.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/toy-photo" style={styles.primaryBtn}>Comenzar ahora</Link>
            <Link to="/signup" style={styles.secondaryBtn}>Registrarme</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderBottom: "1px solid #eee",
  },
  heroInner: { textAlign: "center", maxWidth: 800 },
  h1: { fontSize: 32, margin: "0 0 8px" },
  h2: { fontSize: 26, margin: "0 0 12px" },
  p: { margin: "0 0 12px" },
  pSmall: { marginTop: 8, opacity: 0.85 },

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

  section: { padding: 24, maxWidth: 1100, margin: "0 auto" },

  steps: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 },
  stepItem: { display: "flex", gap: 12, alignItems: "flex-start" },
  stepNum: {
    width: 28, height: 28, borderRadius: "50%",
    display: "grid", placeItems: "center",
    border: "1px solid #ccc",
    fontSize: 14,
  },
  stepTitle: { fontWeight: 600 },
  stepDesc: { opacity: 0.9 },

  videoBox: {
    width: "100%",
    height: 360,
    background: "#e9e9e9",
    border: "1px dashed #ccc",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  card: { border: "1px solid #eee", borderRadius: 8, overflow: "hidden" },
  caption: { padding: 8, fontSize: 14 },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  th: { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" },
  td: { borderBottom: "1px solid #eee", padding: "8px 6px" },

  finalCta: {
    padding: 32,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "center",
  },
};
