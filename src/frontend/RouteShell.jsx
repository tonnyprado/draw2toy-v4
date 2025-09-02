import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Envoltorio que anima la entrada de cada ruta y hace scrollTop */
export default function RouteShell({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Lleva al tope en cada cambio de ruta
    window.scrollTo({ top: 0, behavior: "instant" }); // "instant" evita saltos
  }, [pathname]);

  // Clave por pathname => se remonta y dispara la animación .page-shell
  return (
    <div key={pathname} className="page-shell">
      {children}
    </div>
  );
}
