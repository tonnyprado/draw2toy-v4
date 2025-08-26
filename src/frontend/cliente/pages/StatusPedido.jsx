// src/frontend/pages/StatusPedido.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTicketById, updateTicket } from "../../../backend/db/ticketsService";

export default function StatusPedido() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    getTicketById(ticketId).then(t => {
      if (!active) return;
      if (!t) setNotFound(true);
      setTicket(t);
      setEmail(t?.contactEmail || "");
    });
    return () => { active = false; };
  }, [ticketId]);

  async function saveEmail() {
    if (!email) return;
    setSaving(true);
    try {
      await updateTicket(ticketId, { contactEmail: email });
      // refresca local
      setTicket((t) => ({ ...t, contactEmail: email }));
      alert("Correo guardado para notificaciones.");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el correo.");
    } finally {
      setSaving(false);
    }
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  if (notFound) {
    return (
      <section style={{ padding: 16 }}>
        <h1>Ticket no encontrado</h1>
        <p>Verifica que el número sea correcto.</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    );
  }

  if (!ticket) return <section style={{ padding: 16 }}><div>Cargando...</div></section>;

  return (
    <section style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <h1>Status del pedido</h1>

      <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <strong>Número de ticket:</strong> <code>{ticketId}</code>
        <button onClick={copyId}>{copied ? "¡Copiado!" : "Copiar"}</button>
      </p>

      <p><strong>Estado:</strong> {ticket.status}</p>
      <p><strong>Total:</strong> ${ticket.total}</p>

      <h3>Items</h3>
      <ul>
        {(ticket.items || []).map((it, idx) => (
          <li key={idx}>
            {it.name} — {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"} — x{it.qty} — ${it.price * it.qty}
          </li>
        ))}
      </ul>

      {/* Email opcional */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <h3>Recibe actualizaciones por correo (opcional)</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          />
          <button onClick={saveEmail} disabled={!email || saving}>
            {saving ? "Guardando..." : "Guardar correo"}
          </button>
        </div>
        {ticket.contactEmail && (
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
            Correo actual: <strong>{ticket.contactEmail}</strong>
          </p>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Link to="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
