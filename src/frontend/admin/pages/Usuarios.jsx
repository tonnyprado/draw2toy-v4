import { useEffect, useMemo, useState } from "react";
import { adminListTickets } from "../../../backend/db/ticketsService.js";

export default function Usuarios() {
  const [rows, setRows] = useState(null);
  useEffect(() => { adminListTickets().then(setRows); }, []);

  const users = useMemo(() => {
    const map = new Map(); // key: contactEmail || userId
    (rows || []).forEach(t => {
      const key = (t.contactEmail || t.userId || "anon");
      const prev = map.get(key) || { key, contactEmail: t.contactEmail || null, userId: t.userId || null, count: 0, total: 0 };
      prev.count += 1;
      prev.total += Number(t.total || 0);
      map.set(key, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [rows]);

  if (!rows) return <section style={{ padding: 16 }}><div>Cargando...</div></section>;

  return (
    <section style={{ padding: 16 }}>
      <h1>Usuarios (derivado de pedidos)</h1>
      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th>Contacto</th><th>UserId</th><th># Pedidos</th><th>Total gastado</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.key}>
              <td>{u.contactEmail || "-"}</td>
              <td>{u.userId || "-"}</td>
              <td>{u.count}</td>
              <td>${u.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ opacity: 0.8, marginTop: 8 }}>* Esta vista usa solo los tickets; más adelante podemos migrar a una colección formal de usuarios.</p>
    </section>
  );
}
