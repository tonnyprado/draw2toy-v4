import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// ⬇️ AJUSTA ESTA RUTA SEGÚN TU ESTRUCTURA
import { addContactMessage } from "../../../backend/services/contactService";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general"); // general | pedido | soporte | colaboracion
  const [orderId, setOrderId] = useState("");        // opcional
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Anti-spam honeypot (debe permanecer vacío)
  const [website, setWebsite] = useState("");

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (website) return; // honeypot

    if (!name.trim() || !email.trim() || !message.trim()) {
      return alert("Por favor completa nombre, email y mensaje.");
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) return alert("Por favor escribe un correo válido.");
    if (message.length > 2000) return alert("El mensaje no puede superar 2000 caracteres.");

    setBusy(true);
    try {
      await addContactMessage({
        name,
        email,
        subject,
        orderId: orderId || null,
        message,
        source: "contact_form",
        sourcePath: window.location.pathname,
      });
      setSubmitted(true);
      setName(""); setEmail(""); setSubject("general"); setOrderId(""); setMessage("");
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar tu mensaje. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <section className="container" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }} className="reveal is-visible">
          <h1 className="h1" style={{ marginTop: 0 }}>¡Gracias por tu mensaje! 🎉</h1>
          <p className="muted">Te responderemos a {email || "tu correo"} lo antes posible.</p>
          <div className="mt-6" />
          <div className="flex gap-4" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="btn">Ir al inicio</Link>
            <Link to="/before" className="btn btn-primary">Crear mi juguete</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ padding: 16, maxWidth: 920, margin: "0 auto" }}>
      <header className="reveal">
        <h1 className="h1 wobble" style={{ marginTop: 0 }}>Contacto</h1>
        <p className="muted">¿Tienes dudas, quieres cotizar o dar seguimiento? Escríbenos aquí.</p>
      </header>

      <div className="grid gap-8 mt-6" style={{ gridTemplateColumns: "1fr" }}>
        {/* Formulario */}
        <form className="card reveal" d-1 onSubmit={onSubmit} noValidate>
          {/* Honeypot hidden */}
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid gap-6" style={{ gridTemplateColumns: "1fr", marginBottom: 8 }}>
            <label>
              <div className="h3">Nombre</div>
              <input
                className="input"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                style={{ marginTop: 6 }}
              />
            </label>

            <label>
              <div className="h3">Email</div>
              <input
                className="input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{ marginTop: 6 }}
              />
            </label>

            <label>
              <div className="h3">Motivo</div>
              <select
                className="select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ marginTop: 6 }}
              >
                <option value="general">Consulta general</option>
                <option value="pedido">Estado de pedido</option>
                <option value="soporte">Soporte técnico</option>
                <option value="colaboracion">Colaboraciones</option>
              </select>
            </label>

            <label>
              <div className="h3">Número de ticket (opcional)</div>
              <input
                className="input"
                placeholder="Ej.: aBc123XyZ"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                style={{ marginTop: 6 }}
              />
            </label>

            <label>
              <div className="h3">Mensaje</div>
              <textarea
                className="textarea"
                rows={6}
                placeholder="Cuéntanos en qué te ayudamos…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ marginTop: 6, resize: "vertical" }}
              />
            </label>
          </div>

          <div className="mt-6" />
          <div className="flex gap-4" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Link to="/" className="btn">Cancelar</Link>
            <button className="btn btn-primary floaty" disabled={busy}>
              {busy ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>

        {/* Datos de contacto / redes */}
        <aside className="reveal" d-2>
          <div className="card">
            <div className="h3" style={{ marginTop: 0 }}>También puedes escribirnos</div>
            <p className="muted" style={{ marginBottom: 8 }}>Correo: <strong>hola@draw2toy.example</strong></p>
            <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
              <a href="#" className="btn">Instagram</a>
              <a href="#" className="btn">TikTok</a>
              <a href="#" className="btn">YouTube</a>
              <a href="#" className="btn">Facebook</a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
