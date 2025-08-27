import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { isAdmin } from "./utils/roles.js";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (requireAdmin && !isAdmin(user)) {
    // si no es admin, lo mandamos al inicio
    return <Navigate to="/" replace />;
  }
  return children;
}
