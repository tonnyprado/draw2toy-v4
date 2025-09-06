import { useEffect, useMemo, useState } from "react";
import { adminListTickets, updateTicket } from "../../../backend/db/ticketsService.js";
import { Link, useLocation } from "react-router-dom";

const STATUSES = ["CREADO", "PAGADO", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];

const STATUS_CLASS = {
  CREADO: "badge-neutral",
  PAGADO: "badge-info",
  EN_PROCESO: "badge-warning",
  ENVIADO: "badge-accent",
  ENTREGADO: "badge-success",
  CANCELADO: "badge-error",
};

const CURRENCY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const formatMoney = (n) => (typeof n === "number" ? CURRENCY.format(n) : (n ? CURRENCY.format(Number(n) || 0) : "-"));
const formatDateTime = (seconds) => (seconds ? new Date(seconds * 1000).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "-");

// Mapeo de estilos por estado (colores suaves + buen contraste)
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
  const label = raw === "ALL" ? "TODOS" : raw.replaceAll("_", " ");
  const sizing = size === "sm" ? "text-[11px] h-6 min-w-[5.5rem] px-3" : "text-xs h-7 min-w-[6.5rem] px-3";
  return (
    <span className={`inline-flex items-center justify-center rounded-full whitespace-nowrap ${sizing} ${cls} font-medium tracking-wide uppercase`}>{label}</span>
  );
}

function StatusMenu({ value, onChange, disabled }) {
  // Popover propio (sin DaisyUI dropdown) para evitar espacios raros
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-outline btn-sm"
        disabled={disabled}
      >
        Cambiar estado
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3 ml-1" aria-hidden>
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <>
          {/* Capa para cerrar al hacer click fuera */}
          <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />

          {/* Panel alineado al botón, altura ajustada al contenido */}
          <div className="absolute right-0 top-full z-50 mt-2 min-w-52 rounded-xl border border-base-200 bg-base-100 p-2 shadow-xl">
            {STATUSES.map((s) => (
              <button
                key={s}
                disabled={s === value}
                onClick={() => {
                  if (s === 'CANCELADO' && value !== 'CANCELADO') {
                    const ok = window.confirm('¿Seguro que quieres marcar este pedido como CANCELADO?');
                    if (!ok) return;
                  }
                  onChange?.(s);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <StatusPill status={s} size="sm" />
                {s === value ? <span className="badge badge-ghost badge-xs">actual</span> : null}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Pedidos() {
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [saving, setSaving] = useState({}); // { [ticketId]: 'status' | 'tracking' }

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

  // Prefill de búsqueda desde /admin/usuarios (query ?q= o state.prefill)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const incoming = sp.get("q") || location.state?.prefill;
    if (incoming) setQ(incoming);
    // No dependencias para que solo se ejecute al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counters = useMemo(() => {
    const c = { ALL: 0 };
    for (const s of STATUSES) c[s] = 0;
    for (const t of rows || []) {
      c.ALL++;
      c[t.status] = (c[t.status] || 0) + 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return (rows || []).filter((t) => {
      const matchesText = (t.id || "").toLowerCase().includes(s)
        || (t.contactEmail || "").toLowerCase().includes(s)
        || (t.userId || "").toLowerCase().includes(s)
        || (t.shipping?.trackingId || "").toLowerCase().includes(s);
      const matchesStatus = statusFilter === "ALL" ? true : t.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [rows, q, statusFilter]);

  const changeStatus = async (t, status) => {
    setSaving((m) => ({ ...m, [t.id]: "status" }));
    try {
      await updateTicket(t.id, { status });
      await load();
    } finally {
      setSaving((m) => ({ ...m, [t.id]: undefined }));
    }
  };

  const saveTracking = async (t, trackingId) => {
    setSaving((m) => ({ ...m, [t.id]: "tracking" }));
    try {
      const shipping = { ...(t.shipping || {}), trackingId, status: trackingId ? "ASSIGNED" : (t.shipping?.status || "UNASSIGNED") };
      await updateTicket(t.id, { shipping });
      await load();
    } finally {
      setSaving((m) => ({ ...m, [t.id]: undefined }));
    }
  };

  return (
    <section className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm opacity-70">Administra y rastrea los pedidos y su estado</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : null}
            {loading ? " Actualizando..." : "Refrescar"}
          </button>
        </div>
      </header>

      {/* Toolbar de búsqueda y filtros */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="input input-bordered input-sm flex items-center gap-2 w-full md:max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 opacity-70"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z"/></svg>
              <input
                className="grow"
                placeholder="Buscar por ID, email, userId o tracking..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <div className="text-xs opacity-70">{filtered.length} resultados</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", ...STATUSES].map((s) => (
              <button
                key={s}
                className={`btn btn-xs ${statusFilter === s ? "btn-neutral" : "btn-ghost"}`}
                onClick={() => setStatusFilter(s)}
              >
                <StatusPill status={s === "ALL" ? "TODOS" : s} size="sm" />
                <span className="ml-2 opacity-70">{counters[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="text-xs">
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Email</th>
                  <th>Tracking</th>
                  <th className="text-right">Ver</th>
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td><div className="h-4 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-28 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-16 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-40 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-8 w-40 bg-base-200 rounded skeleton" /></td>
                      <td className="text-right"><div className="h-8 w-16 bg-base-200 rounded skeleton" /></td>
                    </tr>
                  ))}
                </tbody>
              ) : filtered.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      <div className="py-10 text-center opacity-70">No se encontraron pedidos con esos filtros.</div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td className="max-w-[260px] truncate"><code title={t.id} className="text-xs">{t.id}</code></td>
                      <td>{formatDateTime(t.createdAt?.seconds)}</td>
                      <td className="flex items-center gap-2">
                        <StatusPill status={t.status} />
                        <StatusMenu
                          value={t.status}
                          onChange={(val) => changeStatus(t, val)}
                          disabled={saving[t.id] === 'status'}
                        />
                        {saving[t.id] === 'status' ? <span className="loading loading-spinner loading-xs" /> : null}
                      </td>
                      <td className="font-medium">{formatMoney(t.total)}</td>
                      <td className="truncate max-w-[240px]">{t.contactEmail || "-"}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            defaultValue={t.shipping?.trackingId || ""}
                            placeholder="Tracking..."
                            onBlur={(e) => saveTracking(t, e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                            className="input input-bordered input-xs w-full md:w-56"
                          />
                          {saving[t.id] === 'tracking' ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={(e) => {
                                const el = e.currentTarget.previousElementSibling;
                                if (el && 'value' in el) saveTracking(t, el.value);
                              }}
                            >
                              Guardar
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/status/${t.id}`}
                          state={{ fromAdmin: true, backTo: "/admin/pedidos" }}
                          className="btn btn-ghost btn-xs"
                        >
                          Abrir
                        </Link>
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
