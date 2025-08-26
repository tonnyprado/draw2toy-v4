// Estructura de ticket (pedido)
export function newTicket({ userId = null, items, total, status = "CREADO", contactEmail = null }) {
  return {
    userId,                      // opcional (null si compra como invitado)
    items,                       // [{productId, name, price, qty}]
    total,                       // number
    status,                      // CREADO | PAGADO | EN_PROCESO | ENVIADO | ENTREGADO | CANCELADO
    contactEmail,                // opcional, se puede completar tras comprar
    beforePhotoURL: null,        // para enlazar la imagen final/proceso después
    toyPhotoURL: null,
    payment: { provider: null, intentId: null, status: "PENDING" },  // placeholders
    shipping: { provider: null, trackingId: null, status: "UNASSIGNED" }, // placeholders
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
