// src/frontend/pages/StatusPedido.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { getTicketById, updateTicket } from "../../../backend/db/ticketsService.js";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

export default function StatusPedido() {
  const { ticketId } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();

  const fromAdmin = Boolean(state?.fromAdmin);
  const backTo = state?.backTo || "/admin";

  const [ticket, setTicket] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cargar ticket una vez
  useEffect(() => {
    let active = true;
    document.title = `Pedido ${ticketId} • Estado`;
    (async () => {
      const t = await getTicketById(ticketId);
      if (!active) return;
      if (!t) {
        setNotFound(true);
        return;
      }
      setTicket(t);
      setEmail(t.contactEmail || "");
    })();
    return () => { active = false; };
  }, [ticketId]);

  const canEditEmail = useMemo(() => {
    // Invitado solo puede fijar contactEmail UNA vez y mientras esté pendiente.
    // Para usuarios logueados, tus reglas también restringen a pendiente.
    if (!ticket) return false;
    const isPending = ticket.status === "pendiente";
    const notSetYet = !ticket.contactEmail;
    return isPending && notSetYet;
  }, [ticket]);

  async function saveEmail() {
    if (!email || !ticket) return;
    setSaving(true);
    try {
      await updateTicket(ticketId, { contactEmail: email });
      setTicket((t) => (t ? { ...t, contactEmail: email } : t));
      alert("Correo guardado para notificaciones.");
    } catch (e) {
      console.error(e);
      // Permisos: probablemente ya tenía correo o no está pendiente
      if (String(e?.code || "").includes("permission-denied")) {
        alert("No se pudo guardar el correo. Solo se puede fijar una vez mientras el pedido está pendiente.");
      } else {
        alert("No se pudo guardar el correo.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  }

  if (notFound) {
    return (
      <section style={{ padding: 16 }}>
        <h1>Ticket no encontrado</h1>
        <p>Verifica que el número sea correcto.</p>
        {fromAdmin ? (
          <button className="btn" onClick={() => nav(backTo)}>Volver al panel admin</button>
        ) : (
          <Link className="btn" to="/">Volver al inicio</Link>
        )}
      </section>
    );
  }

  if (!ticket) {
    return (
      <section style={{ padding: 32, display: "grid", placeItems: "center" }}>
        <div className="muted">Cargando estado del pedido…</div>
      </section>
    );
  }

  const totalSafe = Number(ticket.total || 0);

  return (
    <section style={{ padding: 16, maxWidth: 860, margin: "0 auto" }}>
      <h1 className="h1" style={{ marginBottom: 8 }}>Status del pedido</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong>Número de ticket:</strong> <code>{ticketId}</code>
        </div>
        <button className="btn" onClick={copyId}>{copied ? "¡Copiado!" : "Copiar"}</button>
        <span
          style={{
            marginLeft: "auto",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: badgeBg(ticket.status),
            color: badgeFg(ticket.status),
          }}
          aria-label={`Estado: ${ticket.status}`}
          title={`Estado: ${ticket.status}`}
        >
          {ticket.status}
        </span>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Total:</strong> {money.format(totalSafe)}
      </div>

      <h3 style={{ marginTop: 20 }}>Items</h3>
      <ul style={{ paddingLeft: 18 }}>
        {(ticket.items || []).map((it, idx) => {
          const qty = Number(it.qty || 1);
          const price = Number(it.price || 0);
          const sub = qty * price;
          return (
            <li key={idx} style={{ marginBottom: 4 }}>
              {it.name || "Juguete personalizado"} — {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"} — x{qty} — {money.format(sub)}
            </li>
          );
        })}
      </ul>

      {/* Email opcional */}
      <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <h3>Recibe actualizaciones por correo (opcional)</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!canEditEmail}
            className="input"
            style={{ padding: 8, minWidth: 260, opacity: canEditEmail ? 1 : 0.6 }}
          />
          <button className="btn btn-primary" onClick={saveEmail} disabled={!canEditEmail || !email || saving}>
            {saving ? "Guardando..." : "Guardar correo"}
          </button>
        </div>
        {ticket.contactEmail && (
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
            Correo registrado: <strong>{ticket.contactEmail}</strong>
          </p>
        )}
        {!canEditEmail && !ticket.contactEmail && (
          <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>
            Solo puedes fijar el correo mientras el pedido está <strong>pendiente</strong>, y una única vez.
          </p>
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        {fromAdmin ? (
          <button className="btn" onClick={() => nav(backTo)}>Volver al panel admin</button>
        ) : (
          <Link className="btn" to="/">Volver al inicio</Link>
        )}
      </div>
    </section>
  );
}

// Helpers visuales (simple badge por estado)
function badgeBg(status) {
  switch ((status || "").toLowerCase()) {
    case "pendiente": return "rgba(255, 193, 7, .15)";   // amarillo
    case "en_produccion": return "rgba(13,110,253,.15)"; // azul
    case "enviado": return "rgba(25,135,84,.15)";        // verde
    case "cancelado": return "rgba(220,53,69,.15)";      // rojo
    default: return "rgba(108,117,125,.15)";             // gris
  }
}
function badgeFg(status) {
  switch ((status || "").toLowerCase()) {
    case "pendiente": return "#856404";
    case "en_produccion": return "#0d6efd";
    case "enviado": return "#198754";
    case "cancelado": return "#dc3545";
    default: return "#6c757d";
  }
}
