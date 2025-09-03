// src/frontend/components/CartSummary.jsx
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default function CartSummary() {
  const { items, total, updateQty, remove } = useCart();

  if (!items.length) {
    return (
      <div
        className="card"
        style={{
          background: "#fff",
          border: "1px solid #E8EAF6",
          borderRadius: 24,
          boxShadow: "0 12px 40px rgba(28,44,90,.06)",
          padding: 24,
        }}
      >
        <h2 className="h2" style={{ marginTop: 0, marginBottom: 8, fontSize: 28 }}>
          Tu carrito
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          Está vacío por ahora. ¡Crea tu primer peluche! 🧸
        </p>
        <div style={{ marginTop: 16 }}>
          <Link to="/toy-photo" className="btn btn-primary">Crear un juguete</Link>
        </div>
      </div>
    );
  }

  const totalSafe = Number(total || 0);

  return (
    <div
      className="card"
      style={{
        background: "#fff",
        border: "1px solid #E8EAF6",
        borderRadius: 24,
        boxShadow: "0 12px 40px rgba(28,44,90,.06)",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: 20, borderBottom: "1px solid #EEF0FB" }}>
        <h2 className="h2" style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
          Tu carrito
        </h2>
        <p className="muted" style={{ margin: "6px 0 0 0", fontSize: 14 }}>
          Revisa cantidades y detalles antes de pagar.
        </p>
      </div>

      {/* Lista */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => {
          const qty = Number(it.qty || 1);
          const price = Number(it.price || 0);
          const sub = qty * price;
          const displayImg = it.imageUrl || it.photoURL || it.photoPreview || null;

          return (
            <li
              key={it.id}
              style={{
                padding: 16,
                borderBottom: "1px solid #EEF0FB",
                display: "grid",
                gridTemplateColumns: "88px 1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              {/* Thumb */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 16,
                  background: "#F7F8FF",
                  border: "1px solid #E6E8EC",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {displayImg ? (
                  <img
                    src={displayImg}
                    alt={it.name || "Juguete personalizado"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <span className="muted" style={{ fontSize: 12 }}>Sin imagen</span>
                )}
              </div>

              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it.name || "Juguete personalizado"}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Tamaño: {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"}
                </div>
                {it.description ? (
                  <div className="muted" style={{ fontSize: 13, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.description}
                  </div>
                ) : null}

                {/* Qty controls */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <button className="btn" onClick={() => updateQty(it.id, Math.max(1, qty - 1))} aria-label="Disminuir">
                    −
                  </button>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value) || 1))}
                    style={{ width: 76, textAlign: "center" }}
                    aria-label="Cantidad"
                  />
                  <button className="btn" onClick={() => updateQty(it.id, qty + 1)} aria-label="Aumentar">
                    +
                  </button>
                </div>
              </div>

              {/* Precio + quitar */}
              <div style={{ textAlign: "right", minWidth: 140 }}>
                <div style={{ fontWeight: 800 }}>{money.format(sub)}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {money.format(price)} c/u
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ marginTop: 10 }}
                  onClick={() => remove(it.id)}
                  aria-label="Quitar del carrito"
                >
                  Quitar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer total */}
      <div
        style={{
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <div className="h3" style={{ marginLeft: "auto" }}>
          Total: {money.format(totalSafe)}
        </div>
        <Link to="/checkout" className="btn btn-primary">Ir a Checkout</Link>
        <Link to="/toy-photo" className="btn">Agregar otro diseño</Link>
      </div>
    </div>
  );
}
