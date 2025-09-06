import { useEffect, useMemo, useState } from "react";
import { db } from "../../../backend/firebase/firebase";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import { updateMessageStatus } from "../../../backend/services/contactService";
import { useAuth } from "../../../context/AuthContext"; // si lo tienes

const STATUSES = [
  { key: "new", label: "Nuevos" },
  { key: "in_progress", label: "En proceso" },
  { key: "resolved", label: "Resueltos" },
  { key: "archived", label: "Archivados" },
];

const STATUS_UI = {
  new: "bg-sky-50 text-sky-900 border border-sky-200",
  in_progress: "bg-amber-50 text-amber-900 border border-amber-200",
  resolved: "bg-emerald-50 text-emerald-900 border border-emerald-200",
  archived: "bg-slate-50 text-slate-800 border border-slate-200",
};

const SUBJECT_LABEL = {
  general: "General",
  pedido: "Estado de pedido",
  soporte: "Soporte",
  colaboracion: "Colaboración",
};

const SUBJECT_UI = {
  general: "bg-indigo-100 text-indigo-900 border border-indigo-200",
  pedido: "bg-violet-100 text-violet-900 border border-violet-200",
  soporte: "bg-rose-100 text-rose-800 border border-rose-200",
  colaboracion: "bg-amber-100 text-amber-900 border border-amber-200",
  __DEFAULT: "bg-neutral-100 text-neutral-700 border border-neutral-200",
};

const formatDateTime = (ts) => {
  try {
    const d = ts?.toDate ? ts.toDate() : null;
    return d ? d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "—";
  } catch (_e) {
    return "—";
  }
};

function Chip({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full whitespace-nowrap text-[11px] h-6 px-3 font-medium ${className}`}>
      {children}
    </span>
  );
}

export default function ContactInbox() {
  const [status, setStatus] = useState("new");
  const [messages, setMessages] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [q, setQ] = useState("");
  const [counts, setCounts] = useState({}); // { new: 0, in_progress: 0, ... }
  const [selected, setSelected] = useState(() => new Set()); // Set<string>
  const { user } = useAuth() || {};

  const fetchCounts = async () => {
    try {
      const results = await Promise.all(
        STATUSES.map(async ({ key }) => {
          const qy = query(collection(db, "contactMessages"), where("status", "==", key));
          const snap = await getCountFromServer(qy);
          return [key, snap.data().count];
        })
      );
    
      setCounts(Object.fromEntries(results));
    } catch (_e) {
      // opcional: log
    }
  };

  const fetchPage = async (next = false) => {
    setLoading(true);
    try {
      let qy = query(
        collection(db, "contactMessages"),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      if (next && lastDoc) qy = query(qy, startAfter(lastDoc));
      const snap = await getDocs(qy);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data(), _ref: d }));
      if (next) setMessages((prev) => [...prev, ...rows]);
      else setMessages(rows);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelected(new Set());
    fetchPage(false);
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    if (!s) return messages;
    return messages.filter((m) =>
      (m.name || "").toLowerCase().includes(s) ||
      (m.email || "").toLowerCase().includes(s) ||
      (m.subject || "").toLowerCase().includes(s) ||
      (m.message || "").toLowerCase().includes(s) ||
      (m.orderId || "").toLowerCase().includes(s)
    );
  }, [messages, q]);

  const allSelectedOnPage = useMemo(() => {
    return filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  }, [filtered, selected]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        filtered.forEach((m) => next.delete(m.id));
      } else {
        filtered.forEach((m) => next.add(m.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const changeStatus = async (id, next) => {
    await updateMessageStatus(id, next, { handledBy: user?.uid || null });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    fetchCounts();
  };

  const bulkChangeStatus = async (next) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => updateMessageStatus(id, next, { handledBy: user?.uid || null })));
      setMessages((prev) => prev.filter((m) => !selected.has(m.id)));
      setSelected(new Set());
      await fetchCounts();
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <section className="p-4 md:p-6 space-y-4">
      {/* Tabs de estado + búsqueda */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                className={`rounded-xl px-3 py-2 text-sm font-medium border ${status === s.key ? STATUS_UI[s.key] : "border-base-200 hover:bg-base-200"}`}
                onClick={() => setStatus(s.key)}
                disabled={loading && status === s.key}
              >
                {s.label}
                <span className="ml-2 badge badge-ghost badge-sm">{counts[s.key] ?? "–"}</span>
              </button>
            ))}
            <div className="ml-auto w-full sm:w-auto">
              <label className="input input-bordered input-sm flex items-center gap-2 w-full sm:w-72">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 opacity-70"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z"/></svg>
                <input
                  className="grow"
                  placeholder="Buscar (nombre, correo, asunto, mensaje, ticket)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(new Set()); fetchPage(false); fetchCounts(); }} disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : null}
              {loading ? " Actualizando..." : "Refrescar"}
            </button>
          </div>
        </div>
      </div>

      {/* Acciones masivas */}
      {selected.size > 0 && (
        <div className="rounded-xl border border-base-200 bg-base-100 p-3 flex flex-wrap items-center gap-2 justify-between">
          <div className="text-sm">
            <strong>{selected.size}</strong> seleccionados
          </div>
          <div className="flex gap-2">
            {status !== "new" && (
              <button className="btn btn-ghost btn-xs" onClick={() => bulkChangeStatus("new")} disabled={bulkLoading}>Reabrir</button>
            )}
            {status !== "in_progress" && (
              <button className="btn btn-xs" onClick={() => bulkChangeStatus("in_progress")} disabled={bulkLoading}>En proceso</button>
            )}
            {status !== "resolved" && (
              <button className="btn btn-success btn-xs" onClick={() => bulkChangeStatus("resolved")} disabled={bulkLoading}>Resuelto</button>
            )}
            {status !== "archived" && (
              <button className="btn btn-outline btn-xs" onClick={() => bulkChangeStatus("archived")} disabled={bulkLoading}>Archivar</button>
            )}
            <button className="btn btn-ghost btn-xs" onClick={clearSelection} disabled={bulkLoading}>Quitar selección</button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="overflow-x-auto w-full">
            <table className="table table-sm">
              <thead className="text-xs">
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={allSelectedOnPage}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Motivo</th>
                  <th>Ticket</th>
                  <th>Asunto</th>
                  <th>Mensaje</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && messages.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td><div className="h-4 w-5 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-28 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-40 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-5 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-24 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-4 w-36 bg-base-200 rounded skeleton" /></td>
                      <td><div className="h-10 w-full bg-base-200 rounded skeleton" /></td>
                      <td className="text-right"><div className="h-8 w-28 bg-base-200 rounded skeleton ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selected.has(m.id)}
                          onChange={() => toggleSelect(m.id)}
                        />
                      </td>
                      <td className="whitespace-nowrap text-sm opacity-70">{formatDateTime(m.createdAt)}</td>
                      <td>{m.name}</td>
                      <td>
                        <a className="link" href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject || "")}`}>
                          {m.email}
                        </a>
                      </td>
                      <td>
                        <Chip className={SUBJECT_UI[m.subject] || SUBJECT_UI.__DEFAULT}>
                          {SUBJECT_LABEL[m.subject] ?? "—"}
                        </Chip>
                      </td>
                      <td className="opacity-80">
                        {m.orderId ? (
                          <Link to={`/status/${m.orderId}`} className="link">{m.orderId}</Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="font-medium">{m.subject === "pedido" ? "Consulta de pedido" : (m.subject || "—")}</td>
                      <td className="max-w-[520px]">
                        <div className="line-clamp-4">{m.message}</div>
                      </td>
                      <td className="space-x-1 text-right">
                        {status !== "new" && (
                          <button className="btn btn-ghost btn-xs" onClick={() => changeStatus(m.id, "new")}>Reabrir</button>
                        )}
                        {status !== "in_progress" && (
                          <button className="btn btn-xs" onClick={() => changeStatus(m.id, "in_progress")}>
                            En proceso
                          </button>
                        )}
                        {status !== "resolved" && (
                          <button className="btn btn-success btn-xs" onClick={() => changeStatus(m.id, "resolved")}>
                            Resuelto
                          </button>
                        )}
                        {status !== "archived" && (
                          <button className="btn btn-outline btn-xs" onClick={() => changeStatus(m.id, "archived")}>
                            Archivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center opacity-70 py-10">Sin mensajes en “{STATUSES.find(s=>s.key===status)?.label || status}”.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {lastDoc && (
        <div className="flex justify-center">
          <button className="btn btn-outline" onClick={() => fetchPage(true)} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : null}
            {loading ? " Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </section>
  );
}