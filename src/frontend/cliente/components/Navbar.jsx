import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

export default function Navbar() {
  const { count } = useCart();

  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
      <Link to="/">Inicio</Link>
      <Link to="/before">¿Cómo funciona?</Link>
      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        <Link to="/toy-photo">Crear juguete</Link>
        <Link to="/checkout">Carrito ({count})</Link>
        <Link to="/login">Entrar</Link>
        <Link to="/signup">Registrarme</Link>
      </div>
    </nav>
  );
}
