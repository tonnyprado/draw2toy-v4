import { useEffect, useMemo, useState } from "react";
import { adminListTickets } from "../../../backend/db/ticketsService.js";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setRows(await adminListTickets()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const s = { total: 0, CREADO: 0, PAGADO: 0, EN_PROCESO: 0, ENVIADO: 0, ENTREGADO: 0, CANCELADO: 0 };
    (rows || []).forEach(t => { s.total++; s[t.status] = (s[t.status] || 0) + 1; });
    return s;
  }, [rows]);

  const last = useMemo(() => (rows || [])
    .slice()
    .sort((a, b) => ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)))
    .slice(0, 8), [rows]);

  return (
    <section style={{ padding: 16 }}>
      <h1>Dashboard (admin)</h1>
      <button onClick={load} disabled={loading}>{loading ? "Actualizando..." : "Refrescar"}</button>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 12 }}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{k}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 16 }}>Últimos tickets</h2>
      {!rows ? <div>Cargando...</div> : (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th>ID</th><th>Estado</th><th>Total</th><th>Email</th><th>Ver</th></tr>
          </thead>
          <tbody>
            {last.map(t => (
              <tr key={t.id}>
                <td><code>{t.id}</code></td>
                <td>{t.status}</td>
                <td>${t.total}</td>
                <td>{t.contactEmail || "-"}</td>
                <td><Link to={`/status/${t.id}`} state={{ fromAdmin: true, backTo: "/admin" }}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
