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

  // Modal (sigue disponible por si lo quieres usar)
  const [showModal, setShowModal] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [emailModal, setEmailModal] = useState("");

  // 📦 Contacto + Dirección + Envío + Pago (placeholder)
  const [contact, setContact] = useState({
    firstName: "", lastName: "", email: "", phone: "",
  });
  const [addr, setAddr] = useState({
    street: "", ext: "", int: "", neighborhood: "",
    city: "", state: "", zip: "", country: "México",
  });
  const [shippingMethod, setShippingMethod] = useState("STANDARD"); // STANDARD | EXPRESS
  const [paymentMethod, setPaymentMethod] = useState("CARD");       // solo placeholder

  const shippingCost = shippingMethod === "EXPRESS" ? 149 : 99;     // DEMO
  const grandTotal = Number(total || 0) + shippingCost;

  const onContactChange = (e) => setContact(s => ({ ...s, [e.target.name]: e.target.value }));
  const onAddrChange = (e) => setAddr(s => ({ ...s, [e.target.name]: e.target.value }));

  const requiredMissing = () => {
    const req = {
      "Nombre(s)": contact.firstName,
      "Apellidos": contact.lastName,
      "Email": contact.email,
      "Teléfono": contact.phone,
      "Calle y número": addr.street || (addr.street && addr.ext),
      "Colonia/Barrio": addr.neighborhood,
      "Ciudad": addr.city,
      "Estado/Provincia": addr.state,
      "Código postal": addr.zip,
      "País": addr.country,
    };
    return Object.entries(req)
      .filter(([_, v]) => !String(v || "").trim())
      .map(([k]) => k);
  };

  const pagarYCrearTicket = async () => {
    if (!items.length) return alert("Tu carrito está vacío.");
    const miss = requiredMissing();
    if (miss.length) return alert(`Completa: ${miss.join(", ")}`);

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
      const subtotal = safeItems.reduce((s, it) => s + (it.price * it.qty), 0);

      const payload = {
        userId: isLogged ? auth.currentUser.uid : null,
        ...(isLogged ? {} : { guest: true }),
        status: "pendiente",
        items: safeItems,
        subtotal,
        shipping: {
          method: shippingMethod,
          cost: shippingCost,
          address: { ...addr },
          contact: { ...contact },
        },
        payment: {
          method: paymentMethod,   // placeholder (Stripe próximamente)
          status: "pending",
        },
        total: subtotal + shippingCost,
      };

      const ticket = await createTicket(payload);

      try {
        items.forEach(it => { if (it.photoPreview && String(it.photoPreview).startsWith("blob:")) URL.revokeObjectURL(it.photoPreview); });
      } catch {}
      clear();
      nav(`/status/${ticket.id}`);

      // Si prefieres modal:
      // setTicketId(ticket.id); setShowModal(true); clear();
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al crear tu ticket.");
    } finally {
      setBusy(false);
    }
  };

  const cerrarModalYVerEstado = async () => {
    if (emailModal && ticketId) {
      try { await updateTicket(ticketId, { contactEmail: emailModal }); }
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
            <Link to="/login" className="btn">Entrar</Link>
            <Link to="/signup" className="btn btn-secondary">Registrarme</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ padding: 16 }}>
      <h1 className="h1">Checkout</h1>

      {/* 🧾 Resumen de carrito */}
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
              const subtotalRow = (Number(it.price || 0) * Number(it.qty || 1)) || 0;
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
                  <td><strong>${subtotalRow}</strong></td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => { try { if (it.photoPreview && it.photoPreview.startsWith("blob:")) URL.revokeObjectURL(it.photoPreview); } catch {} remove(it.id);}}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📮 Dirección + 💳 Pago (placeholder) */}
      <div className="grid gap-8 mt-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* Dirección / Contacto */}
        <div className="card">
          <h2 className="h2" style={{ marginTop: 0 }}>Datos de envío</h2>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <label>
              Nombre(s)
              <input className="input" name="firstName" autoComplete="given-name"
                     value={contact.firstName} onChange={onContactChange} required />
            </label>
            <label>
              Apellidos
              <input className="input" name="lastName" autoComplete="family-name"
                     value={contact.lastName} onChange={onContactChange} required />
            </label>
            <label>
              Email
              <input className="input" type="email" name="email" autoComplete="email"
                     value={contact.email} onChange={onContactChange} required />
            </label>
            <label>
              Teléfono
              <input className="input" type="tel" name="phone" autoComplete="tel"
                     value={contact.phone} onChange={onContactChange} required />
            </label>
          </div>

          <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
            <label style={{ gridColumn: "1 / span 2" }}>
              Calle
              <input className="input" name="street" autoComplete="address-line1"
                     placeholder="Calle y número" value={addr.street} onChange={onAddrChange} required />
            </label>
            <label>
              Ext.
              <input className="input" name="ext" value={addr.ext} onChange={onAddrChange} />
            </label>
            <label>
              Int.
              <input className="input" name="int" value={addr.int} onChange={onAddrChange} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              Colonia / Barrio
              <input className="input" name="neighborhood" autoComplete="address-line2"
                     value={addr.neighborhood} onChange={onAddrChange} required />
            </label>
            <label>
              Ciudad
              <input className="input" name="city" autoComplete="address-level2"
                     value={addr.city} onChange={onAddrChange} required />
            </label>
            <label>
              Estado / Provincia
              <input className="input" name="state" autoComplete="address-level1"
                     value={addr.state} onChange={onAddrChange} required />
            </label>
            <label>
              C.P.
              <input className="input" name="zip" autoComplete="postal-code"
                     value={addr.zip} onChange={onAddrChange} required />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              País
              <input className="input" name="country" autoComplete="country-name"
                     value={addr.country} onChange={onAddrChange} required />
            </label>
          </div>

          <div className="mt-4">
            <div className="h3" style={{ marginBottom: 6 }}>Método de envío</div>
            <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name="ship" value="STANDARD"
                       checked={shippingMethod === "STANDARD"}
                       onChange={() => setShippingMethod("STANDARD")} />
                Standard (3–6 días) — ${99} (demo)
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name="ship" value="EXPRESS"
                       checked={shippingMethod === "EXPRESS"}
                       onChange={() => setShippingMethod("EXPRESS")} />
                Express (1–3 días) — ${149} (demo)
              </label>
            </div>
          </div>
        </div>

        {/* Pago (placeholder) + Resumen */}
        <div className="card">
          <h2 className="h2" style={{ marginTop: 0 }}>Pago (próximamente)</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Integración con Stripe pronto. Por ahora, selecciona tu opción preferida:
          </p>
          <div className="flex" style={{ flexDirection: "column", gap: 10 }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name="pay" value="CARD"
                     checked={paymentMethod === "CARD"}
                     onChange={() => setPaymentMethod("CARD")} />
              Tarjeta de crédito / débito (Stripe)
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name="pay" value="TRANSFER"
                     checked={paymentMethod === "TRANSFER"}
                     onChange={() => setPaymentMethod("TRANSFER")} />
              Transferencia / Depósito
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name="pay" value="CASH"
                     checked={paymentMethod === "CASH"}
                     onChange={() => setPaymentMethod("CASH")} />
              Efectivo / OXXO (próximamente)
            </label>
          </div>

          <hr style={{ margin: "16px 0", borderColor: "var(--border)" }} />

          <div className="grid" style={{ gridTemplateColumns: "1fr auto", rowGap: 8 }}>
            <div className="muted">Subtotal</div>
            <div>${total}</div>
            <div className="muted">Envío ({shippingMethod === "EXPRESS" ? "Express" : "Standard"})</div>
            <div>${shippingCost}</div>
            <div className="h3" style={{ marginTop: 8 }}>Total</div>
            <div className="h3" style={{ marginTop: 8 }}>${grandTotal}</div>
          </div>

          <div className="mt-4 flex" style={{ gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={pagarYCrearTicket} disabled={busy}>
              {busy ? "Procesando..." : "Confirmar y crear pedido"}
            </button>
            <Link to="/toy-photo" className="btn">Agregar otro diseño</Link>
          </div>
        </div>
      </div>

      {/* Enlaces secundarios */}
      <div className="mt-6 flex gap-4" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Link to="/login" className="btn">Entrar</Link>
        <Link to="/signup" className="btn btn-secondary">Registrarme</Link>
      </div>

      {/* Modal de confirmación (opcional / no usado por defecto) */}
      {showModal && (
        <div
          role="dialog" aria-modal="true"
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
                  value={emailModal}
                  onChange={(e) => setEmailModal(e.target.value)}
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
