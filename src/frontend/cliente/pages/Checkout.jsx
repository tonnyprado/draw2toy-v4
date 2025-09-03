// src/frontend/pages/Checkout.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext.jsx";
import { useState } from "react";
import { createTicket, updateTicket } from "../../../backend/db/ticketsService.js";
import { getAuth } from "firebase/auth";
import app from "../../../backend/firebase/firebase";

export default function Checkout() {
  const { items, total, updateQty, remove, clear } = useCart();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  // Modal opcional
  const [showModal, setShowModal] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [email, setEmail] = useState("");

  const pagarYCrearTicket = async () => {
    if (!items.length) return alert("Tu carrito está vacío.");
    setBusy(true);

    try {
      const auth = getAuth(app);
      const isLogged = !!auth.currentUser;

      const safeItems = items.map(({ id, name, price, qty, size, description, imageUrl, photoURL }) => ({
        productId: id,
        name: name || "Juguete personalizado",
        price: Number(price ?? 0),
        qty: Number(qty ?? 1),
        size: size === "GRANDE" ? "GRANDE" : "STANDARD",
        description: description ? String(description) : null,
        photoURL: imageUrl || photoURL || null,
      }));
      const totalCalc = safeItems.reduce((s, it) => s + (it.price * it.qty), 0);

      const payload = {
        // reglas:
        //  - logueado: userId == uid y guest ausente o false
        //  - invitado: userId == null y guest == true
        userId: isLogged ? auth.currentUser.uid : null,
        ...(isLogged ? {} : { guest: true }),
        status: "pendiente",
        items: safeItems,
        total: totalCalc,
        // status lo establece newTicket() como "pendiente" (asegúrate en tu modelo)
      };

      const ticket = await createTicket(payload);

      try{
        items.forEach(it => {if (it.photoPreview && String(it.photoPreview).startsWith('blob:')) URL.revokeObjectURL(it.photoPreview); });
      } catch {}
      clear();
      nav(`/status/${ticket.id}`);

      // Si prefieres modal en vez de navegar directo:
      // setTicketId(ticket.id); setShowModal(true); clear();
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al crear tu ticket.");
    } finally {
      setBusy(false);
    }
  };

  const cerrarModalYVerEstado = async () => {
    if (email && ticketId) {
      try { await updateTicket(ticketId, { contactEmail: email }); }
      catch (e) { console.warn("No se pudo guardar el email opcional:", e); }
    }
    setShowModal(false);
    nav(`/status/${ticketId}`);
  };

  if (!items.length) {
    return (
      <section className="container" style={{ padding: 16 }}>
        <h1 className="h1">Checkout</h1>
        <p className="muted">Tu carrito está vacío.</p>
        <div className="mt-4 flex gap-4">
          <Link to="/toy-photo" className="btn btn-primary">Crear un juguete</Link>
          <div className="flex gap-4">
            <Link to="/login" className="btn">Sign in</Link>
            <Link to="/signup" className="btn btn-secondary">Sign up</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ padding: 16 }}>
      <h1 className="h1">Checkout</h1>

      {/* Lista de items */}
      <div className="card mt-6">
        <table className="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const subtotal = (Number(it.price || 0) * Number(it.qty || 1)) || 0;
              const displayImg = it.imageUrl || it.photoURL || it.photoPreview || null;
              return (
                <tr key={it.id}>
                  <td>
                    <div style={{
                      width: 72, height: 72, borderRadius: 12,
                      background: "#F7F8FF", border: "1px solid #E6E8EC",
                      display: "grid", placeItems: "center", overflow: "hidden"
                    }}>
                      {displayImg
                        ? <img src={displayImg} alt={it.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                        : <span className="muted" style={{ fontSize: 12 }}>Sin imagen</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{it.name || "Juguete personalizado"}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Tamaño: {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"}
                    </div>
                    {it.description && (
                      <div className="muted" style={{ fontSize: 13 }}>{it.description}</div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button className="btn" onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}>−</button>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value) || 1))}
                        style={{ width: 80, textAlign: "center" }}
                      />
                      <button className="btn" onClick={() => updateQty(it.id, it.qty + 1)}>+</button>
                    </div>
                  </td>
                  <td>${Number(it.price || 0)}</td>
                  <td><strong>${subtotal}</strong></td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => { try { if (it.photoPreview && it.photoPreview.startsWith('blob:')) URL.revokeObjectURL(it.photoPreview); } catch {} remove(it.id);}}>Quitar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total y acciones */}
      <div className="mt-6 flex gap-4" style={{ flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ marginLeft: "auto" }} className="h3">
          Total: ${total}
        </div>
      </div>

      <div className="mt-4 flex gap-4" style={{ flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={pagarYCrearTicket} disabled={busy}>
          {busy ? "Procesando..." : "Proceder a la compra"}
        </button>
        <Link to="/toy-photo" className="btn">Agregar otro diseño</Link>
        <div style={{ marginLeft: "auto" }} className="flex gap-4">
          <Link to="/login" className="btn">Sign in</Link>
          <Link to="/signup" className="btn btn-secondary">Sign up</Link>
        </div>
      </div>

      {/* Placeholder datos de envío */}
      <div className="card mt-6">
        <h2 className="h2">Datos de envío (placeholder)</h2>
        <p className="muted">
          Aquí pondremos el formulario de dirección y contacto, y más tarde conectaremos el pago real.
        </p>
      </div>

      {/* Modal de confirmación (opcional) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "grid", placeItems: "center", padding: 16, zIndex: 40
          }}
        >
          <div className="card" style={{ width: "100%", maxWidth: 520 }}>
            <h2 className="h2" style={{ marginTop: 0 }}>¡Gracias por tu compra!</h2>
            <p>Tu número de ticket es:</p>
            <div style={{
              padding: "8px 12px", border: "2px dashed var(--border)", borderRadius: 10,
              display: "inline-block", fontFamily: "monospace"
            }}>
              {ticketId}
            </div>

            <div className="mt-4">
              <label>
                ¿Quieres recibir actualizaciones por correo? (opcional)
                <input
                  type="email"
                  className="input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ marginTop: 6 }}
                />
              </label>
            </div>

            <div className="mt-4 flex" style={{ justifyContent: "flex-end", gap: 12 }}>
              <button className="btn btn-primary" onClick={cerrarModalYVerEstado}>Continuar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
