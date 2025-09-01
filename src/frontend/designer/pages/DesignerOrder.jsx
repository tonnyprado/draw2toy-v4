import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkOrderById } from "../../../backend/db/workOrdersService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { isDigitalDesigner, isPatternDesigner } from "../../../utils/roles.js";

export default function DesignerOrder() {
  const { ticketId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);

  const iAmDigital = isDigitalDesigner(user);
  const iAmPattern = isPatternDesigner(user);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await getWorkOrderById(ticketId);
      if (active) { setWo(data); setLoading(false); }
    })();
    return () => { active = false; };
  }, [ticketId]);

  if (loading) return <section style={{ padding: 16 }}><div>Cargando…</div></section>;
  if (!wo) return (
    <section style={{ padding: 16 }}>
      <h1>Pedido no encontrado</h1>
      <button onClick={() => nav("/designer")}>Volver</button>
    </section>
  );

  return (
    <section style={{ padding: 16 }}>
      <h1>Orden de trabajo</h1>
      <p><strong>ID:</strong> <code>{wo.id}</code></p>
      <p><strong>Juguete:</strong> {wo.toy?.name || "-"}</p>
      <p><strong>Tamaño:</strong> {wo.toy?.size || "-"}</p>
      {wo.toy?.description && <p><strong>Descripción:</strong> {wo.toy.description}</p>}

      <h3>Foto original</h3>
      {wo.beforePhoto?.url ? (
        <a href={wo.beforePhoto.url} target="_blank" rel="noreferrer">Ver / Descargar</a>
      ) : (
        <div>Sin foto aún</div>
      )}

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <h3>Digital designer</h3>
        <p><strong>Status:</strong> {wo.digital?.status || "PENDING"}</p>
        <ul>
          {(wo.digital?.assets || []).map((a, i) => (
            <li key={i}><a href={a.url} target="_blank" rel="noreferrer">{a.name || a.url}</a></li>
          ))}
        </ul>
        {iAmDigital && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button disabled>Marcar descargado (próx.)</button>
            <button disabled>Subir archivo (próx.)</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <h3>Pattern designer</h3>
        <p><strong>Status:</strong> {wo.pattern?.status || "PENDING"}</p>
        <ul>
          {(wo.pattern?.assets || []).map((a, i) => (
            <li key={i}><a href={a.url} target="_blank" rel="noreferrer">{a.name || a.url}</a></li>
          ))}
        </ul>
        {iAmPattern && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button disabled>Subir patrones (próx.)</button>
            <button disabled>Enviar a fábrica (próx.)</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => nav("/designer")}>Volver al panel</button>
      </div>
    </section>
  );
}
