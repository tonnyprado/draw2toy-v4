// src/frontend/admin/pages/Analytics.jsx
import { useEffect, useMemo, useState } from "react";
import { adminListTickets } from "../../../backend/db/ticketsService.js";

const CURRENCY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const fmtMoney = (n) => (typeof n === "number" ? CURRENCY.format(n) : "-");
const toDateStr = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const fromSecs = (s) => (s ? new Date(s * 1000) : null);

const STATUS_COLORS = {
  CREADO:    "#64748b", // slate
  PAGADO:    "#0ea5e9", // sky
  EN_PROCESO:"#f59e0b", // amber
  ENVIADO:   "#8b5cf6", // violet
  ENTREGADO: "#10b981", // emerald
  CANCELADO: "#ef4444", // red
};

/* ----------- KPI tile oscuro (texto blanco siempre legible) ----------- */
function KpiDark({ label, value, tone = "bg-slate-800" }) {
  return (
    <div className={`rounded-xl p-4 ${tone} text-white shadow-sm`}>
      <div className="text-xs opacity-90">{label}</div>
      <div className="mt-1 text-[28px] leading-none font-semibold tracking-wide">{value}</div>
    </div>
  );
}

export default function Analytics() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  // filtros
  const today = new Date();
  const thirtyAgo = new Date(); thirtyAgo.setDate(today.getDate() - 30);

  const [from, setFrom] = useState(toDateStr(thirtyAgo));
  const [to, setTo]     = useState(toDateStr(today));

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminListTickets();
      setRows(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ---- filtrar por fechas (inclusive) ----
  const filtered = useMemo(() => {
    const start = new Date(from + "T00:00:00");
    const end   = new Date(to   + "T23:59:59");
    return (rows || []).filter(t => {
      const d = fromSecs(t.createdAt?.seconds) || new Date(0);
      return d >= start && d <= end;
    });
  }, [rows, from, to]);

  // ---- KPIs y agrupaciones ----
  const kpis = useMemo(() => {
    const s = {
      total: 0, ingresos: 0, aov: 0, uniq: 0,
      byStatus: {}, byDay: new Map(), byCustomer: new Map(),
    };
    const seen = new Set();

    for (const t of filtered) {
      s.total++;
      const total = Number(t.total || 0);
      s.ingresos += total;

      const key = t.contactEmail || t.userId || "anon";
      if (!seen.has(key)) { seen.add(key); }
      // status
      s.byStatus[t.status] = (s.byStatus[t.status] || 0) + 1;

      // por día
      const day = toDateStr(fromSecs(t.createdAt?.seconds) || new Date(0));
      s.byDay.set(day, (s.byDay.get(day) || 0) + total);

      // top clientes
      const c = s.byCustomer.get(key) || { key, email: t.contactEmail || "-", userId: t.userId || "-", count: 0, total: 0 };
      c.count += 1; c.total += total; s.byCustomer.set(key, c);
    }
    s.uniq = seen.size;
    s.aov = s.total ? s.ingresos / s.total : 0;
    return s;
  }, [filtered]);

  // serie diaria continua entre from..to
  const dailySeries = useMemo(() => {
    const start = new Date(from + "T00:00:00");
    const end   = new Date(to   + "T00:00:00");
    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
      const key = toDateStr(d);
      out.push({ x: key, y: kpis.byDay.get(key) || 0 });
    }
    return out;
  }, [kpis, from, to]);

  const statusEntries = Object.entries(kpis.byStatus)
    .map(([status, count]) => ({ status, count, color: STATUS_COLORS[status] || "#94a3b8" }))
    .sort((a,b)=> b.count - a.count);

  const topClients = Array.from(kpis.byCustomer.values()).sort((a,b)=> b.total - a.total).slice(0,8);

  // ---- export CSV ----
  const downloadCSV = (filename, rows) => {
    const csv = rows.map(r => r.map(v => {
      const s = (v ?? "").toString();
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join("," )).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportTicketsCSV = () => {
    const header = ["id","fecha","status","total","email","userId"];
    const data = filtered.map(t => ([
      t.id,
      fromSecs(t.createdAt?.seconds)?.toISOString() ?? "",
      t.status || "",
      Number(t.total || 0),
      t.contactEmail || "",
      t.userId || "",
    ]));
    downloadCSV(`tickets_${from}_a_${to}.csv`, [header, ...data]);
  };

  const exportResumenCSV = () => {
    const header = ["kpi","valor"];
    const rows = [
      ["Pedidos", kpis.total],
      ["Ingresos", kpis.ingresos],
      ["Ticket promedio", kpis.aov],
      ["Usuarios únicos", kpis.uniq],
    ];
    downloadCSV(`resumen_${from}_a_${to}.csv`, [header, ...rows]);
  };

  // ---- gráficos SVG ultraligeros ----
  const LineChart = ({ data, height=140, stroke="#6C63FF" }) => {
    const w = 560, h = height, pad = 12;
    const ys = data.map(p => p.y);
    const maxY = Math.max(1, ...ys);
    const points = data.map((p,i) => {
      const x = pad + (i/(Math.max(1,data.length-1))) * (w - pad*2);
      const y = h - pad - (p.y/maxY) * (h - pad*2);
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height }}>
        <polyline fill="none" stroke={stroke} strokeWidth="2.5" points={points} />
        {data.map((p,i)=> {
          const x = pad + (i/(Math.max(1,data.length-1))) * (w - pad*2);
          const y = h - pad - (p.y/maxY) * (h - pad*2);
          return <circle key={i} cx={x} cy={y} r="2.5" fill={stroke} />;
        })}
      </svg>
    );
  };

  const BarChart = ({ items, height=140 }) => {
    const w = 560, h = height, pad = 12;
    const max = Math.max(1, ...items.map(i=>i.count));
    const barW = (w - pad*2) / Math.max(1, items.length);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height }}>
        {items.map((it, i) => {
          const x = pad + i*barW + 4;
          const bH = (it.count/max) * (h - pad*2);
          const y = h - pad - bH;
          return (
            <g key={it.status}>
              <rect x={x} y={y} width={barW - 8} height={bH} rx="6" fill={it.color} opacity="0.85" />
              <text x={x + (barW-8)/2} y={h-2} textAnchor="middle" fontSize="10" fill="#334155">
                {it.status.replaceAll("_"," ")}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <section className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analíticas</h1>
          <p className="text-sm opacity-70">Ventas y actividad (sin depender de APIs externas).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportResumenCSV} className="btn btn-ghost btn-sm">Exportar resumen CSV</button>
          <button onClick={exportTicketsCSV} className="btn btn-sm btn-primary">Exportar tickets CSV</button>
          <button onClick={load} disabled={loading} className="btn btn-sm">
            {loading ? "Cargando…" : "Refrescar"}
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs opacity-70">Desde</label>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="input input-bordered input-sm ml-2" />
          </div>
          <div>
            <label className="text-xs opacity-70">Hasta</label>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="input input-bordered input-sm ml-2" />
          </div>
          <span className="text-xs opacity-60 ml-auto">
            Mostrando {filtered.length} tickets
          </span>
        </div>
      </div>

      {/* KPIs (ahora con fondo oscuro y texto blanco) */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <KpiDark label="Pedidos" value={kpis.total}            tone="bg-slate-800" />
        <KpiDark label="Ingresos" value={fmtMoney(kpis.ingresos)} tone="bg-violet-700" />
        <KpiDark label="Ticket promedio" value={fmtMoney(kpis.aov)} tone="bg-sky-700" />
        <KpiDark label="Usuarios únicos" value={kpis.uniq}       tone="bg-emerald-700" />
      </div>

      {/* Gráficos */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Ingresos diarios</h3>
            <LineChart data={dailySeries} />
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">Pedidos por estado</h3>
            {statusEntries.length ? <BarChart items={statusEntries} /> : <div className="opacity-70 py-6">Sin datos.</div>}
          </div>
        </div>
      </div>

      {/* Top clientes */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Top clientes por gasto</h3>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="text-xs">
                <tr>
                  <th>Contacto</th>
                  <th>UserID</th>
                  <th># Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {topClients.length ? topClients.map(c => (
                  <tr key={c.key}>
                    <td className="truncate max-w-[220px]">{c.email}</td>
                    <td className="truncate max-w-[180px]">{c.userId}</td>
                    <td>{c.count}</td>
                    <td className="font-medium">{fmtMoney(c.total)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="opacity-70 py-8 text-center">Sin datos en el rango.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-xs opacity-60">
        * Todo se calcula en el navegador a partir de tus tickets. Más adelante podemos conectar Stripe para métricas avanzadas.
      </p>
    </section>
  );
}
