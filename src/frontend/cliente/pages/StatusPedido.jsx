import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTicketById } from "../../../backend/db/ticketsService";

export default function StatusPedido() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    getTicketById(ticketId).then(t => {
      if (!active) return;
      if (!t) setNotFound(true);
      setTicket(t);
    });
    return () => { active = false; };
  }, [ticketId]);

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
    <section style={{ padding: 16 }}>
      <h1>Status del pedido</h1>
      <p><strong>Número de ticket:</strong> <code>{ticketId}</code></p>
      <p><strong>Estado:</strong> {ticket.status}</p>
      <p><strong>Total:</strong> ${ticket.total}</p>
      {ticket.contactEmail && <p><strong>Contacto:</strong> {ticket.contactEmail}</p>}

      <h3>Items</h3>
      <ul>
        {(ticket.items || []).map((it, idx) => (
          <li key={idx}>
            {it.name} — {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"} — x{it.qty} — ${it.price * it.qty}
          </li>
        ))}
      </ul>

      {/* Placeholders para acciones futuras */}
      <div style={{ marginTop: 12 }}>
        <button disabled>Descargar comprobante (próximamente)</button>
        <button disabled style={{ marginLeft: 8 }}>Ver guía de envío (cuando exista)</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Link to="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
