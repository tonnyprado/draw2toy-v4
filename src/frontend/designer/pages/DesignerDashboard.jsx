import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listWorkOrdersForUser } from "../../../backend/db/workOrdersService.js";

export default function DesignerDashboard() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try { setRows(await listWorkOrdersForUser(null)); } // el servicio internamente no usa user en esta maqueta
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return (rows || []).filter(w =>
      (w.id || "").toLowerCase().includes(s)
      || (w.toy?.name || "").toLowerCase().includes(s)
      || (w.toy?.size || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <section style={{ padding: 16 }}>
      <h1>Dashboard (diseñadores)</h1>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
        <input
          placeholder="Buscar por ID o nombre de juguete…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <button onClick={load} disabled={loading}>{loading ? "Actualizando…" : "Refrescar"}</button>
      </div>

      {!rows ? <div>Cargando…</div> : (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th><th>Juguete</th><th>Tamaño</th>
              <th>Digital</th><th>Pattern</th><th>Progreso</th><th>Ver</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id}>
                <td><code>{w.id}</code></td>
                <td>{w.toy?.name || "-"}</td>
                <td>{w.toy?.size || "-"}</td>
                <td>{w.digital?.status || "PENDING"}</td>
                <td>{w.pattern?.status || "PENDING"}</td>
                <td>{(w.progress ?? 0)}%</td>
                <td>
                  <Link to={`/designer/orders/${w.id}`}>Abrir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
