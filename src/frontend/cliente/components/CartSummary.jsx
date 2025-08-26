// src/frontend/components/CartSummary.jsx
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

export default function CartSummary() {
  const { items, total, updateQty, remove } = useCart();

  if (!items.length) {
    return (
      <div>
        <h2>Resumen</h2>
        <p>Tu carrito está vacío.</p>
        <Link to="/toy-photo">Crear un juguete</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Resumen</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0", display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Tamaño: {it.size === "GRANDE" ? "Grande 50 cm" : "Standard 30 cm"}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <button onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}>-</button>
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value) || 1))}
                  style={{ width: 56, textAlign: "center" }}
                />
                <button onClick={() => updateQty(it.id, it.qty + 1)}>+</button>
              </div>
            </div>
            <div style={{ textAlign: "right", minWidth: 110 }}>
              <div>${(it.price || 0) * it.qty}</div>
              <button style={{ marginTop: 6 }} onClick={() => remove(it.id)}>Quitar</button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 10, textAlign: "right" }}>
        <strong>Total: ${total}</strong>
      </div>

      <div style={{ marginTop: 10 }}>
        <Link to="/checkout">Ir a Checkout</Link>
      </div>
    </div>
  );
}
