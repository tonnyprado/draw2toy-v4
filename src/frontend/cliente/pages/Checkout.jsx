import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext.jsx";
import { useState } from "react";
import { createTicket, updateTicket } from "../../../backend/db/ticketsService.js";

export default function Checkout() {
  const { items, total, updateQty, remove, clear } = useCart();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  // Modal de confirmación
  const [showModal, setShowModal] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [email, setEmail] = useState("");

  const pagarYCrearTicket = async () => {
    if (!items.length) return alert("Tu carrito está vacío.");
    setBusy(true);
    try {
      // Crea el ticket REAL en Firestore (pago demo por ahora)
      const safeItems = items.map(({ id, name, price, qty, size, description }) => ({
        productId: id,
        name: name || "Juguete personalizado",
        price: Number(price ?? 0),
        qty: Number(qty ?? 1),
        size: size === "GRANDE" ? "GRANDE" : "STANDARD",
        description: description ? String(description) : null, // null en lugar de undefined
      }));

      const ticket = await createTicket({
        items: safeItems,
        total: safeItems.reduce((s, it) => s + (it.price * it.qty), 0),
        // contactEmail: null  // opcional
      });
      clear();
      nav(`/status/${ticket.id}`);
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al crear tu ticket.");
    } finally {
      setBusy(false);
    }
  };

  const cerrarModalYVerEstado = async () => {
    if (email && ticketId) {
      try {
        await updateTicket(ticketId, { contactEmail: email });
      } catch (e) {
        console.warn("No se pudo guardar el email opcional:", e);
      }
    }
    setShowModal(false);
    nav(`/status/${ticketId}`);
  };

  if (!items.length) {
    return (
      <section style={{ padding: 16 }}>
        <h1>Checkout</h1>
        <p>Tu carrito está vacío.</p>
        <Link to="/toy-photo">Crear un juguete</Link>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: 16 }}>
      <h1>Checkout</h1>

      {/* Lista de items */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0", display: "flex", gap: 12 }}>
            <div style={{ width: 96, height: 96, background: "#f2f2f2", display: "grid", placeItems: "center" }}>
              {it.photoPreview
                ? <img src={it.photoPreview} alt={it.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                : <span>Sin imagen</span>}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Tamaño: {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"}
              </div>
              {it.description && <div style={{ fontSize: 13, opacity: 0.85 }}>{it.description}</div>}

              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}>-</button>
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value) || 1))}
                  style={{ width: 60, textAlign: "center" }}
                />
                <button onClick={() => updateQty(it.id, it.qty + 1)}>+</button>
              </div>
            </div>

            <div style={{ textAlign: "right", minWidth: 120 }}>
              <div>${(it.price || 0) * it.qty}</div>
              <button style={{ marginTop: 8 }} onClick={() => remove(it.id)}>Quitar</button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12, textAlign: "right" }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Total: ${total}</div>
      </div>

      {/* Acciones principales */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={pagarYCrearTicket} disabled={busy}>
          {busy ? "Procesando..." : "Proceder a la compra"}
        </button>
        <Link to="/toy-photo">Agregar otro diseño</Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </div>

      {/* Placeholder datos de envío */}
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <h2>Datos de envío (placeholder)</h2>
        <p style={{ opacity: 0.85 }}>
          Aquí pondremos el formulario de dirección y contacto, y más tarde conectaremos el pago real.
        </p>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
          <div style={modalStyles.modal}>
            <h2 style={{ marginTop: 0 }}>¡Gracias por tu compra!</h2>
            <p>Tu número de ticket es:</p>
            <div style={modalStyles.ticketBox}>{ticketId}</div>

            <div style={{ marginTop: 12 }}>
              <label>
                ¿Quieres recibir actualizaciones por correo? (opcional)
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: 8, marginTop: 6 }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={cerrarModalYVerEstado}>Continuar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const modalStyles = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
    display: "grid", placeItems: "center", padding: 16, zIndex: 40,
  },
  modal: {
    background: "#fff", borderRadius: 8, padding: 16, width: "100%", maxWidth: 520,
    boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
  },
  ticketBox: {
    padding: "8px 12px", border: "1px dashed #999", borderRadius: 6, display: "inline-block",
    fontFamily: "monospace",
  }
};
