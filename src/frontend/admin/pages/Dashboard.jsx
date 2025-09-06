import { useEffect, useMemo, useState } from "react";
import { adminListTickets } from "../../../backend/db/ticketsService.js";
import { Link } from "react-router-dom";

const CURRENCY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const formatMoney = (n) => (typeof n === "number" ? CURRENCY.format(n) : "-");
const formatDateTime = (seconds) => (seconds ? new Date(seconds * 1000).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "-");

// === Chips de estado con color (igual que en Pedidos.jsx) ===
const STATUS_UI = {
  CREADO: "bg-slate-100 text-slate-700 border border-slate-200",
  PAGADO: "bg-sky-100 text-sky-800 border border-sky-200",
  EN_PROCESO: "bg-amber-100 text-amber-900 border border-amber-200",
  ENVIADO: "bg-violet-100 text-violet-800 border border-violet-200",
  ENTREGADO: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  CANCELADO: "bg-rose-100 text-rose-800 border border-rose-200",
  PENDIENTE: "bg-gray-100 text-gray-700 border border-gray-200",
  __DEFAULT: "bg-neutral-100 text-neutral-700 border border-neutral-200",
};

function StatusPill({ status, size = "md" }) {
  const raw = (status || "").toUpperCase();
  const cls = STATUS_UI[raw] || STATUS_UI.__DEFAULT;
  const label = raw.replaceAll("_", " ");
  const sizing = size === "sm" ? "text-[11px] h-6 min-w-[5.5rem] px-3" : "text-xs h-7 min-w-[6.5rem] px-3";
  return (
    <span className={`inline-flex items-center justify-center rounded-full whitespace-nowrap ${sizing} ${cls} font-medium tracking-wide uppercase`}>{label}</span>
  );
}

// === Colores por tarjeta KPI (texto forzado visible) ===
const KPI_STYLE = {
  TOTAL: "bg-indigo-50 text-indigo-900 border border-indigo-200",
  CREADO: "bg-slate-50 text-slate-800 border border-slate-200",
  PAGADO: "bg-sky-50 text-sky-900 border border-sky-200",
  EN_PROCESO: "bg-amber-50 text-amber-900 border border-amber-200",
  ENVIADO: "bg-violet-50 text-violet-900 border border-violet-200",
  ENTREGADO: "bg-emerald-50 text-emerald-900 border border-emerald-200",
  CANCELADO: "bg-rose-50 text-rose-900 border border-rose-200",
};

function Kpi({ label, value, styleKey }) {
  const cls = KPI_STYLE[styleKey] || "bg-base-100 text-base-content border border-base-200";
  return (
    <div className={`rounded-xl p-4 ${cls}`}>
      <div className="text-xs/none font-medium opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminListTickets();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const s = { total: 0, CREADO: 0, PAGADO: 0, EN_PROCESO: 0, ENVIADO: 0, ENTREGADO: 0, CANCELADO: 0 };
    (rows || []).forEach((t) => { s.total++; s[t.status] = (s[t.status] || 0) + 1; });
    return s;
  }, [rows]);

  const last = useMemo(() => (rows || []).slice().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8), [rows]);

  return (
    <section className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-base-content">Dashboard</h1>
          <p className="text-sm text-base-content/70">Resumen general y últimos tickets</p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-primary btn-sm">
          {loading ? <span className="loading loading-spinner" /> : null}
          {loading ? " Actualizando..." : "Refrescar"}
        </button>
      </header>

      {/* KPIs */}
      <div className="card bg-transparent shadow-none">
        <div className="card-body p-0">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            <Kpi label="Total" value={stats.total} styleKey="TOTAL" />
            <Kpi label="Creado" value={stats.CREADO} styleKey="CREADO" />
            <Kpi label="Pagado" value={stats.PAGADO} styleKey="PAGADO" />
            <Kpi label="En proceso" value={stats.EN_PROCESO} styleKey="EN_PROCESO" />
            <Kpi label="Enviado" value={stats.ENVIADO} styleKey="ENVIADO" />
            <Kpi label="Entregado" value={stats.ENTREGADO} styleKey="ENTREGADO" />
            <Kpi label="Cancelado" value={stats.CANCELADO} styleKey="CANCELADO" />
          </div>
        </div>
      </div>

      {/* Últimos tickets */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-base-content">Últimos tickets</h2>
            <span className="text-xs text-base-content/60">Mostrando {last.length} de {rows?.length ?? 0}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="text-xs">
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Email</th>
                  <th className="text-right">Ver</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td><div className="h-4 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-28 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-20 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-16 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-40 bg-base-200 rounded skeleton" /></td>
                      <td className="text-right"><div className="h-8 w-16 bg-base-200 rounded skeleton" /></td>
                    </tr>
                  ))}
                </tbody>
              ) : last.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6}>
                      <div className="py-10 text-center opacity-70">Sin tickets aún.</div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {last.map((t) => (
                    <tr key={t.id}>
                      <td><code className="text-xs">{t.id}</code></td>
                      <td>{formatDateTime(t.createdAt?.seconds)}</td>
                      <td><StatusPill status={t.status} /></td>
                      <td className="font-medium">{formatMoney(t.total)}</td>
                      <td className="truncate max-w-[220px]">{t.contactEmail || "-"}</td>
                      <td className="text-right">
                        <Link to={`/status/${t.id}`} state={{ fromAdmin: true, backTo: "/admin" }} className="btn btn-ghost btn-xs">Abrir</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
