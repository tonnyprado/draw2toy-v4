import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./cliente/components/Navbar.jsx";
import Footer from "./cliente/components/Footer.jsx";

export default function RouteShell({ children }) {
  const { pathname } = useLocation();
  const isBackoffice = pathname.startsWith("/admin") || pathname.startsWith("/designer");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div key={pathname} className="page-shell">
      {/* Navbar/Footer públicos solo en sitio cliente */}
      {!isBackoffice && <Navbar />}

      {/* 👇 Nada de pt-16: el header sticky ya empuja el contenido */}
      <main>
        {children}
      </main>

      {!isBackoffice && <Footer />}
    </div>
  );
}
