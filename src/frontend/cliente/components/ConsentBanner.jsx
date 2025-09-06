import { useEffect, useState } from "react";
import "../../../ui-design/pages/ConsentBanner.css";

const LS_KEY = "consent.v1";

function getStored() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); }
  catch { return null; }
}
function saveStored(prefs) {
  localStorage.setItem(LS_KEY, JSON.stringify({ ...prefs, ts: Date.now() }));
  window.dispatchEvent(new CustomEvent("consent:updated", { detail: prefs }));
  window.__consent = prefs; // accesible globalmente
}

export function hasConsent(kind) {
  const s = getStored();
  return !!(s && s[kind]);
}

export default function ConsentBanner() {
  const [shown, setShown] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const s = getStored();
    return s || { necessary: true, analytics: false, marketing: false };
  });

  useEffect(() => {
    // Mostrar sólo si no hay preferencia guardada
    if (!getStored()) setShown(true);
    window.__consent = getStored() || prefs;
  }, []);

  const acceptAll = () => {
    const p = { necessary: true, analytics: true, marketing: true };
    saveStored(p);
    setPrefs(p);
    setShown(false);
  };
  const rejectAll = () => {
    const p = { necessary: true, analytics: false, marketing: false };
    saveStored(p);
    setPrefs(p);
    setShown(false);
  };
  const savePrefs = () => {
    const p = { ...prefs, necessary: true };
    saveStored(p);
    setShown(false);
  };

  // Botón flotante para reabrir ajustes
  const Reopen = () => (
    <button
      className="consent-reopen"
      onClick={() => { setSettingsOpen(true); setShown(true); }}
      aria-label="Abrir configuración de privacidad"
      title="Privacidad"
    >
      ⚙️
    </button>
  );

  return (
    <>
      {!shown ? <Reopen /> : null}

      {shown && (
        <div className={`consent-wrap ${settingsOpen ? "is-settings" : ""}`} role="dialog" aria-modal="true">
          <div className="consent-card">
            {!settingsOpen ? (
              <>
                <h3 className="consent-title">Tu privacidad</h3>
                <p className="consent-text">
                  Usamos cookies necesarias para que BLUNDY funcione y, con tu permiso, cookies de
                  <strong> analítica</strong> para mejorar el servicio. Puedes cambiar tu elección cuando quieras en{" "}
                  <button className="linklike" onClick={() => setSettingsOpen(true)}>Configuración</button>.
                  Revisa el <a href="/privacy" className="consent-link">Aviso de Privacidad</a>.
                </p>
                <div className="consent-actions">
                  <button className="btn" onClick={rejectAll}>Rechazar opcionales</button>
                  <button className="btn" onClick={() => setSettingsOpen(true)}>Configurar</button>
                  <button className="btn btn-primary" onClick={acceptAll}>Aceptar todo</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="consent-title">Configuración de cookies</h3>
                <div className="consent-options">
                  <label className="consent-row">
                    <span>
                      <strong>Necesarias</strong> (siempre activas)
                      <small> Requeridas para iniciar sesión, carrito, seguridad.</small>
                    </span>
                    <input type="checkbox" checked disabled />
                  </label>

                  <label className="consent-row">
                    <span>
                      <strong>Analíticas</strong>
                      <small> Nos ayudan a entender el uso (ej. páginas más visitadas).</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                    />
                  </label>

                  <label className="consent-row">
                    <span>
                      <strong>Marketing</strong>
                      <small> Personalización y campañas (no esencial).</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={prefs.marketing}
                      onChange={(e) => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                    />
                  </label>
                </div>

                <div className="consent-actions">
                  <button className="btn" onClick={rejectAll}>Rechazar todo</button>
                  <button className="btn" onClick={() => setShown(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={savePrefs}>Guardar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
