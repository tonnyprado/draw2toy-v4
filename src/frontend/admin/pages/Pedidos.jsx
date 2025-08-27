import { useEffect, useMemo, useState } from "react";
import { adminListTickets, updateTicket } from "../../../backend/db/ticketsService.js";
import { Link } from "react-router-dom";

const STATUSES = ["CREADO", "PAGADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];

export default function Pedidos() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");

  const load = async () => setRows(await adminListTickets());
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return (rows || []).filter(t =>
      t.id.toLowerCase().includes(s)
      || (t.contactEmail || "").toLowerCase().includes(s)
      || (t.userId || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const changeStatus = async (t, status) => {
    await updateTicket(t.id, { status });
    await load();
  };

  const saveTracking = async (t, trackingId) => {
    const shipping = { ...(t.shipping || {}), trackingId, status: trackingId ? "ASSIGNED" : (t.shipping?.status || "UNASSIGNED") };
    await updateTicket(t.id, { shipping });
    await load();
  };

  if (!rows) return <section style={{ padding: 16 }}><div>Cargando...</div></section>;

  return (
    <section style={{ padding: 16 }}>
      <h1>Pedidos</h1>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
        <input
          placeholder="Buscar por ID, email, userId..."
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <button onClick={load}>Refrescar</button>
      </div>

      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th><th>Estado</th><th>Total</th><th>Email</th><th>Tracking</th><th>Ver</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id}>
              <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                <code title={t.id}>{t.id}</code>
              </td>
              <td>
                <select defaultValue={t.status} onChange={e => changeStatus(t, e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td>${t.total}</td>
              <td>{t.contactEmail || "-"}</td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    defaultValue={t.shipping?.trackingId || ""}
                    placeholder="Tracking..."
                    onBlur={(e) => saveTracking(t, e.target.value)}
                    style={{ padding: 6 }}
                  />
                </div>
              </td>
              <td><Link to={`/status/${t.id}`} state={{ fromAdmin: true, backTo: "/admin/pedidos" }}>Abrir</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
