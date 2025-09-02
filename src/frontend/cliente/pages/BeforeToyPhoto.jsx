// src/frontend/pages/BeforeToyPhoto.jsx
import { Link } from "react-router-dom";
import { useEffect } from "react";

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
    { plan: "Básico",   incluye: "Tamaño chico, 1 revisión",  precio: "TBD", tiempo: "TBD" },
    { plan: "Premium",  incluye: "Tamaño mediano, 2 revisiones", precio: "TBD", tiempo: "TBD" },
    { plan: "XL",       incluye: "Tamaño grande, 2 revisiones",  precio: "TBD", tiempo: "TBD" },
  ];

  // Reveal on scroll
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div>
      {/* Hero / CTA inicial */}
      <section className="container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 900 }}>
          <h1 className="h1 wobble reveal">¿Cómo funciona?</h1>
          <p className="muted reveal" d-1>Conoce el proceso antes de empezar y mira ejemplos reales.</p>
          <div className="mt-4">
            <Link to="/toy-photo" className="btn btn-primary btn-hero floaty reveal" d-2>
              Crear juguete
            </Link>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="container">
        <h2 className="h2 reveal">Pasos del proceso</h2>
        <ol className="grid gap-6 mt-6" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {steps.map((s, i) => (
            <li key={s.id} className="reveal" d-1 style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                className="badge"
                style={{ width: 32, height: 32, display: "grid", placeItems: "center", fontWeight: 700 }}
                aria-label={`Paso ${s.id}`}
              >
                {s.id}
              </div>
              <div>
                <div className="h3">{s.title}</div>
                <div className="muted">{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Video "Cómo se hacen" */}
      <section className="container mt-8">
        <h2 className="h2 reveal">Cómo se hacen</h2>
        <div className="card reveal" d-1 style={{ padding: 0 }}>
          <div style={{
            width: "100%", height: 380, background: "#F7F8FF",
            border: "2px dashed var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden"
          }}>
            <video style={{ width: "100%", height: "100%", objectFit: "cover" }} src="" controls muted />
          </div>
        </div>
        <p className="muted reveal" d-2 style={{ marginTop: 8 }}>
          Aquí irá un video corto mostrando el proceso de elaboración (corte, costura, ensamblado).
        </p>
      </section>

      {/* Galería */}
      <section className="container mt-8">
        <h2 className="h2 reveal">Galería</h2>
        <div className="grid gap-6 mt-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {gallery.map((g, idx) => (
            <figure key={g.id} className="card reveal" d-1 style={{ padding: 0, overflow: "hidden" }}>
              <img src={g.src} alt={g.caption} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
              <figcaption style={{ padding: 10, fontSize: 14 }}>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Lista de precios (TBD) */}
      <section className="container mt-8">
        <h2 className="h2 reveal">Lista de precios (referencial)</h2>
        <div className="card reveal" d-1 style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Incluye</th>
                <th>Desde</th>
                <th>Tiempo estimado</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.plan}</td>
                  <td>{r.incluye}</td>
                  <td>{r.precio}</td>
                  <td>{r.tiempo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted reveal" d-2 style={{ marginTop: 8 }}>
          * Los valores son demostrativos. Ajustaremos precios y tiempos reales con tu OK.
        </p>
      </section>

      {/* CTA final */}
      <section className="container mt-8 reveal" style={{ textAlign: "center" }}>
        <h2 className="h2" style={{ marginTop: 0 }}>¿Listo para convertir un dibujo en un recuerdo?</h2>
        <p className="muted">Empieza ahora mismo.</p>
        <div className="flex gap-4" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/toy-photo" className="btn btn-primary btn-hero floaty">Comenzar ahora</Link>
          <Link to="/signup" className="btn btn-secondary">Registrarme</Link>
        </div>
      </section>
    </div>
  );
}
