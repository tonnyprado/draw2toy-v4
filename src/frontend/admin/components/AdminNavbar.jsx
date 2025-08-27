import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={{ fontWeight: 700 }}>Admin • draw2toy</div>
      <div style={styles.links}>
        <NavLink to="/admin" style={styles.link}>Dashboard</NavLink>
        <NavLink to="/admin/pedidos" style={styles.link}>Pedidos</NavLink>
        <NavLink to="/admin/usuarios" style={styles.link}>Usuarios</NavLink>
      </div>
      <div>
        <span style={{ marginRight: 8, opacity: 0.9 }}>{user?.email}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky", top: 56, zIndex: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, padding: "10px 12px", borderBottom: "1px solid #eee", background: "#fff",
  },
  links: { display: "flex", gap: 12, alignItems: "center" },
  link: ({ isActive }) => ({
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: isActive ? "#f6f6f6" : "#fff",
    color: "#111",
  }),
};
