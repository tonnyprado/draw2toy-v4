// src/App.jsx
import { useEffect } from "react";
import Home from "./frontend/cliente/pages/Home";
import BeforeToyPhoto from "./frontend/cliente/pages/BeforeToyPhoto";
import { Routes, Route, Navigate } from "react-router-dom";
import ToyPhoto from "./frontend/cliente/pages/ToyPhoto";
import Checkout from "./frontend/cliente/pages/Checkout";
import StatusPedido from "./frontend/cliente/pages/StatusPedido.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminNavbar from "./frontend/admin/components/AdminNavbar.jsx";
import Dashboard from "./frontend/admin/pages/Dashboard.jsx";
import Pedidos from "./frontend/admin/pages/Pedidos.jsx";
import Usuarios from "./frontend/admin/pages/Usuarios.jsx";

import Login from "./frontend/Login.jsx";
import SignUp from "./frontend/SignUp.jsx";
import DesignerNavbar from "./frontend/designer/components/DesignerNavbar.jsx";
import DesignerDashboard from "./frontend/designer/pages/DesignerDashboard.jsx";
import DesignerProtectedRoute from "./DesignerProtectedRoute.jsx";
import DesignerOrder from "./frontend/designer/pages/DesignerOrder.jsx";

import RouteShell from "./frontend/RouteShell.jsx";
import Contact from "./frontend/cliente/pages/Contact.jsx";
import ContactInbox from "./frontend/admin/pages/ContactInbox.jsx";
import ConsentBanner, { hasConsent } from "./frontend/cliente/components/ConsentBanner.jsx";
import Privacy from "./frontend/cliente/pages/Privacy.jsx";
import Analytics from "./frontend/admin/pages/Analytics.jsx";

const GA_ID = import.meta?.env?.VITE_GA_MEASUREMENT_ID;

function loadGA(id) {
  if (!id || typeof window === "undefined" || window.__gaLoaded) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id, { anonymize_ip: true });
  window.__gaLoaded = true;
}

export default function App() {
  useEffect(() => {
    if (hasConsent("analytics")) loadGA(GA_ID);
    const onUpdate = (e) => {
      if (e.detail?.analytics) loadGA(GA_ID);
      else if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
    };
    window.addEventListener("consent:updated", onUpdate);
    return () => window.removeEventListener("consent:updated", onUpdate);
  }, []);

  return (
    <>
      <ConsentBanner />

      <RouteShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/before" element={<BeforeToyPhoto />} />
          <Route path="/toy-photo" element={<ToyPhoto />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/status/:ticketId" element={<StatusPedido />} />

          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute>
                <AdminNavbar />
                <ContactInbox />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/designer"
            element={
              <DesignerProtectedRoute>
                <>
                  <DesignerNavbar />
                  <DesignerDashboard />
                </>
              </DesignerProtectedRoute>
            }
          />
          <Route
            path="/designer/orders/:ticketId"
            element={
              <DesignerProtectedRoute>
                <>
                  <DesignerNavbar />
                  <DesignerOrder />
                </>
              </DesignerProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <AdminNavbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pedidos"
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <AdminNavbar />
                  <Pedidos />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <AdminNavbar />
                  <Usuarios />
                </>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/analytics"
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <AdminNavbar />
                  <Analytics />
                </>
              </ProtectedRoute>
            }
          />

          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteShell>
    </>
  );
}
