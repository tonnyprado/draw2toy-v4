import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { isAdmin } from "../../../utils/roles.js";

export default function DesignerNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Izquierda: marca + links */}
        <div style={styles.left}>
          <div style={styles.brand}>
            <span style={{ fontWeight: 800 }}>Draw2Toy</span>
            <span style={styles.dot}>•</span>
            <span style={{ opacity: .75, fontWeight: 700 }}>Diseñadores</span>
          </div>

          <div style={styles.links}>
            <NavLink to="/designer" style={styles.link}>Dashboard</NavLink>
          </div>
        </div>

        {/* Derecha: admin / email / logout */}
        <div style={styles.right}>
          {isAdmin(user) && (
            <NavLink to="/admin" style={styles.link}>
              Admin
            </NavLink>
          )}
          {user?.email && (
            <span style={styles.email}>{user.email}</span>
          )}
          <button onClick={logout} className="btn" style={styles.logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,                 // <- importante: ya no 56
    zIndex: 50,
    background: "rgba(255,255,255,.75)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "1px solid var(--border)",
  },
  inner: {
    height: 64,             // alto fijo para reservar espacio
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: { display: "flex", alignItems: "center", gap: 14 },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 16,
  },
  dot: { opacity: .35, fontWeight: 900 },
  links: { display: "flex", gap: 8, alignItems: "center" },
  link: ({ isActive }) => ({
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: isActive ? "#fff" : "transparent",
    boxShadow: isActive ? "0 6px 18px rgba(0,0,0,.06)" : "none",
    color: "#111",
    fontWeight: 700,
  }),
  right: { display: "flex", alignItems: "center", gap: 10 },
  email: { fontSize: 13, opacity: .9 },
  logout: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "2px solid var(--border)",
    background: "#fff",
  },
};
