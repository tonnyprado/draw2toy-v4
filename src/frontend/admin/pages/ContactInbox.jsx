import { useEffect, useState } from "react";
import { db } from "../../../backend/firebase/firebase";
import {
  collection, query, where, orderBy, limit, getDocs, startAfter
} from "firebase/firestore";
import { updateMessageStatus } from "../../../backend/services/contactService";
import { useAuth } from "../../../context/AuthContext"; // si lo tienes

const STATUSES = [
  { key: "new", label: "Nuevos" },
  { key: "in_progress", label: "En proceso" },
  { key: "resolved", label: "Resueltos" },
  { key: "archived", label: "Archivados" },
];

const SUBJECT_LABEL = {
  general: "General",
  pedido: "Estado de pedido",
  soporte: "Soporte",
  colaboracion: "Colaboración",
};

export default function ContactInbox() {
  const [status, setStatus] = useState("new");
  const [messages, setMessages] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth() || {};

  const fetchPage = async (next = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "contactMessages"),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      if (next && lastDoc) q = query(q, startAfter(lastDoc));
      const snap = await getDocs(q);
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data(), _ref: d }));
      if (next) setMessages(prev => [...prev, ...rows]);
      else setMessages(rows);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(false); /* eslint-disable-next-line */ }, [status]);

  const changeStatus = async (id, next) => {
    await updateMessageStatus(id, next, { handledBy: user?.uid || null });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUSES.map(s => (
          <button
            key={s.key}
            className={`btn btn-sm ${status === s.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatus(s.key)}
          >
            {s.label}
          </button>
        ))}
        <button className="btn btn-sm ml-auto" onClick={() => fetchPage(false)} disabled={loading}>
          Refrescar
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Motivo</th>
              <th>Ticket</th>
              <th>Asunto</th>
              <th>Mensaje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id} className="align-top">
                <td className="whitespace-nowrap text-sm opacity-70">
                  {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : "—"}
                </td>
                <td>{m.name}</td>
                <td>
                  <a className="link" href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject || "")}`}>
                    {m.email}
                  </a>
                </td>
                <td>
                  <span className="badge">{SUBJECT_LABEL[m.subject] ?? "—"}</span>
                </td>
                <td className="opacity-80">{m.orderId || "—"}</td>
                <td className="font-medium">{m.subject === "pedido" ? "Consulta de pedido" : (m.subject || "—")}</td>
                <td className="max-w-[420px]">
                  <div className="line-clamp-4">{m.message}</div>
                </td>
                <td className="space-x-1">
                  {status !== "in_progress" && (
                    <button className="btn btn-xs" onClick={() => changeStatus(m.id, "in_progress")}>
                      En proceso
                    </button>
                  )}
                  {status !== "resolved" && (
                    <button className="btn btn-xs btn-success" onClick={() => changeStatus(m.id, "resolved")}>
                      Resuelto
                    </button>
                  )}
                  {status !== "archived" && (
                    <button className="btn btn-xs btn-outline" onClick={() => changeStatus(m.id, "archived")}>
                      Archivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!messages.length && !loading && (
              <tr><td colSpan={8} className="text-center opacity-70 py-10">Sin mensajes en “{status}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {lastDoc && (
        <div className="mt-4">
          <button className="btn" onClick={() => fetchPage(true)} disabled={loading}>
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
}
