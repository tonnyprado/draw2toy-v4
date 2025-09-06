import { useEffect, useMemo, useState } from "react";
import { adminListTickets } from "../../../backend/db/ticketsService.js";
import { Link } from "react-router-dom";

const CURRENCY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const formatMoney = (n) => (typeof n === "number" ? CURRENCY.format(n) : (n ? CURRENCY.format(Number(n) || 0) : "-"));
const formatDateTime = (seconds) => (seconds ? new Date(seconds * 1000).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "-");

export default function Usuarios() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("total"); // total | count | last | contact
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

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

  const usersRaw = useMemo(() => {
    const map = new Map(); // key: contactEmail || userId || anon
    (rows || []).forEach((t) => {
      const key = t.contactEmail || t.userId || "anon";
      const prev = map.get(key) || { key, contactEmail: t.contactEmail || null, userId: t.userId || null, count: 0, total: 0, last: 0 };
      prev.count += 1;
      prev.total += Number(t.total || 0);
      const created = t.createdAt?.seconds || 0;
      if (created > (prev.last || 0)) prev.last = created;
      map.set(key, prev);
    });
    return Array.from(map.values());
  }, [rows]);

  const usersFiltered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return usersRaw.filter((u) =>
      (u.contactEmail || "").toLowerCase().includes(s) || (u.userId || "").toLowerCase().includes(s)
    );
  }, [usersRaw, q]);

  const users = useMemo(() => {
    const arr = usersFiltered.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "count": return (a.count - b.count) * dir;
        case "last": return ((a.last || 0) - (b.last || 0)) * dir;
        case "contact": return ((a.contactEmail || a.userId || "").localeCompare(b.contactEmail || b.userId || "")) * dir;
        case "total":
        default: return ((a.total || 0) - (b.total || 0)) * dir;
      }
    });
    return arr;
  }, [usersFiltered, sortKey, sortDir]);

  const kpis = useMemo(() => {
    const totalUsers = usersRaw.length;
    const totalPedidos = (rows || []).length;
    const gastoTotal = usersRaw.reduce((acc, u) => acc + (u.total || 0), 0);
    const ticketPromedio = totalPedidos ? gastoTotal / totalPedidos : 0;
    return { totalUsers, totalPedidos, gastoTotal, ticketPromedio };
  }, [usersRaw, rows]);

  const changeSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Exportar CSV de la tabla (filtrada + ordenada)
  const exportCsv = () => {
    const esc = (v = "") => '"' + String(v).replaceAll('"', '""') + '"';
    const rowsCsv = users.map(u => [
      u.contactEmail || "-",
      u.userId || "-",
      u.count,
      (u.total ?? 0).toFixed(2),
      u.last ? new Date(u.last * 1000).toISOString() : "-",
    ].map(esc).join(","));
    const header = ["Contacto","UserId","# Pedidos","Total gastado","Último pedido"].map(esc).join(",");
    const blob = new Blob([header + "\n" + rowsCsv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0,19).replaceAll(":","-");
    a.href = url;
    a.download = `usuarios-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-base-content">Usuarios</h1>
          <p className="text-sm text-base-content/70">Derivado de pedidos (agrupado por email o userId)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn btn-outline btn-sm" disabled={loading}>Exportar CSV</button>
          <button onClick={load} className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : null}
            {loading ? " Actualizando..." : "Refrescar"}
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="card bg-transparent shadow-none">
        <div className="card-body p-0">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl p-4 bg-indigo-50 text-indigo-900 border border-indigo-200">
              <div className="text-xs/none font-medium opacity-80">Usuarios únicos</div>
              <div className="mt-1 text-2xl font-bold">{kpis.totalUsers}</div>
            </div>
            <div className="rounded-xl p-4 bg-sky-50 text-sky-900 border border-sky-200">
              <div className="text-xs/none font-medium opacity-80">Pedidos totales</div>
              <div className="mt-1 text-2xl font-bold">{kpis.totalPedidos}</div>
            </div>
            <div className="rounded-xl p-4 bg-emerald-50 text-emerald-900 border border-emerald-200">
              <div className="text-xs/none font-medium opacity-80">Gasto total</div>
              <div className="mt-1 text-2xl font-bold">{formatMoney(kpis.gastoTotal)}</div>
            </div>
            <div className="rounded-xl p-4 bg-amber-50 text-amber-900 border border-amber-200">
              <div className="text-xs/none font-medium opacity-80">Ticket promedio</div>
              <div className="mt-1 text-2xl font-bold">{formatMoney(kpis.ticketPromedio)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="input input-bordered input-sm flex items-center gap-2 w-full md:max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 opacity-70"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z"/></svg>
              <input
                className="grow"
                placeholder="Buscar por email o userId..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <div className="text-xs opacity-70">{users.length} usuarios</div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="text-xs">
                <tr>
                  <th>
                    <button className="link link-hover" onClick={() => changeSort("contact")}>Contacto</button>
                  </th>
                  <th>UserId</th>
                  <th>
                    <button className="link link-hover" onClick={() => changeSort("count")}># Pedidos</button>
                  </th>
                  <th>
                    <button className="link link-hover" onClick={() => changeSort("total")}>Total gastado</button>
                  </th>
                  <th>
                    <button className="link link-hover" onClick={() => changeSort("last")}>Último pedido</button>
                  </th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td><div className="h-4 w-44 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-52 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-16 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-28 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-6 w-24 bg-base-200 rounded skeleton ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              ) : users.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6}>
                      <div className="py-10 text-center opacity-70">Sin usuarios encontrados.</div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {users.map((u) => (
                    <tr key={u.key}>
                      <td className="truncate max-w-[260px]">{u.contactEmail || "-"}</td>
                      <td className="truncate max-w-[260px]">{u.userId || "-"}</td>
                      <td className="font-medium">{u.count}</td>
                      <td className="font-semibold">{formatMoney(u.total)}</td>
                      <td>{formatDateTime(u.last)}</td>
                      <td className="text-right">
                        <Link
                          to={`/admin/pedidos?q=${encodeURIComponent(u.contactEmail || u.userId || "")}`}
                          state={{ prefill: u.contactEmail || u.userId || "" }}
                          className="btn btn-ghost btn-xs"
                        >
                          Ver pedidos
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

      <p className="text-xs text-base-content/60">* Esta vista usa solo los tickets; más adelante podemos migrar a una colección formal de usuarios.</p>
    </section>
  );
}
