// src/DesignerProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { isAnyDesigner, isAdmin } from "./utils/roles.js";

export default function DesignerProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Permite admin y diseñadores
  if (!isAnyDesigner(user) && !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
