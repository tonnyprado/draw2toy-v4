import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listWorkOrdersForUser } from "../../../backend/db/workOrdersService.js";

/* —— Paleta simple para chips de estado —— */
const CHIP = {
  PENDING:   { bg: "#F1F5F9", fg: "#334155", br: "#E2E8F0", label: "Pendiente" },
  IN_PROGRESS: { bg: "#FFF7ED", fg: "#7C2D12", br: "#FED7AA", label: "En proceso" },
  DONE:      { bg: "#ECFDF5", fg: "#065F46", br: "#A7F3D0", label: "Listo" },
  BLOCKED:   { bg: "#FEF2F2", fg: "#7F1D1D", br: "#FECACA", label: "Bloqueado" },
  // fallback
  __:        { bg: "#F7F8FF", fg: "#3F3D56", br: "#E6E8EC", label: s => s }
};

function StatusChip({ value }) {
  const key = String(value || "PENDING").toUpperCase();
  const c = CHIP[key] || CHIP.__;
  const label = c.label instanceof Function ? c.label(key) : c.label;
  return (
    <span
      className="badge"
      style={{
        background: c.bg, color: c.fg, border: `1px solid ${c.br}`,
        fontWeight: 700
      }}
    >
      {label}
    </span>
  );
}

function Kpi({ hint, value }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="muted" style={{ fontSize: 12, letterSpacing: ".6px" }}>{hint}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

export default function DesignerDashboard() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // (En tu maqueta no usamos el user)
      const data = await listWorkOrdersForUser(null);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return (rows || []).filter(w =>
      (w.id || "").toLowerCase().includes(s) ||
      (w.toy?.name || "").toLowerCase().includes(s) ||
      (w.toy?.size || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  // KPIs rápidos
  const stats = useMemo(() => {
    const s = { total: 0, digitalPend: 0, patternPend: 0, done: 0 };
    (rows || []).forEach(w => {
      s.total++;
      const d = String(w.digital?.status || "PENDING").toUpperCase();
      const p = String(w.pattern?.status || "PENDING").toUpperCase();
      if (d === "PENDING" || d === "IN_PROGRESS") s.digitalPend++;
      if (p === "PENDING" || p === "IN_PROGRESS") s.patternPend++;
      if (d === "DONE" && p === "DONE") s.done++;
    });
    return s;
  }, [rows]);

  return (
    <section className="container" style={{ padding: "16px 16px 24px" }}>
      {/* Encabezado */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Panel de Diseñadores</h1>
          <div className="muted" style={{ fontSize: 13 }}>Órdenes de trabajo asignadas</div>
        </div>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? "Actualizando…" : "Refrescar"}
        </button>
      </header>

      {/* Buscador */}
      <div className="card" style={{ padding: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              className="input"
              placeholder="Buscar por ID, nombre o tamaño…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                opacity: .6
              }}
            >🔎</span>
          </div>
          <div className="muted" style={{ whiteSpace: "nowrap", fontSize: 12 }}>
            {filtered.length} de {rows?.length ?? 0}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 16 }}>
        <Kpi hint="Órdenes totales" value={stats.total} />
        <Kpi hint="Digital pendientes / en curso" value={stats.digitalPend} />
        <Kpi hint="Pattern pendientes / en curso" value={stats.patternPend} />
        <Kpi hint="Completas (Digital + Pattern)" value={stats.done} />
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0 }}>
        {!rows ? (
          <div style={{ padding: 18 }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 18 }} className="muted">Sin resultados con “{q}”.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Juguete</th>
                  <th>Tamaño</th>
                  <th>Digital</th>
                  <th>Pattern</th>
                  <th style={{ width: 180 }}>Progreso</th>
                  <th className="text-right">Ver</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => {
                  const prog = Math.max(0, Math.min(100, Number(w.progress ?? 0)));
                  return (
                    <tr key={w.id}>
                      <td><code style={{ fontSize: 12 }}>{w.id}</code></td>
                      <td style={{ fontWeight: 600 }}>{w.toy?.name || "-"}</td>
                      <td>{w.toy?.size || "-"}</td>
                      <td><StatusChip value={w.digital?.status} /></td>
                      <td><StatusChip value={w.pattern?.status} /></td>
                      <td>
                        <div className="progress"><span style={{ width: `${prog}%` }} /></div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link to={`/designer/orders/${w.id}`} className="btn">Abrir</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
