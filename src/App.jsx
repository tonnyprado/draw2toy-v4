import Home from "./frontend/cliente/pages/Home";
import BeforeToyPhoto from "./frontend/cliente/pages/BeforeToyPhoto";
import { Routes, Route, Navigate } from "react-router-dom";
import ToyPhoto from "./frontend/cliente/pages/ToyPhoto";
import Checkout from "./frontend/cliente/pages/Checkout";
import StatusPedido from "./frontend/cliente/pages/StatusPedido.jsx";
import Navbar from "./frontend/cliente/components/Navbar.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/before" element={<BeforeToyPhoto />} />
      <Route path="/toy-photo" element={<ToyPhoto />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/status/:ticketId" element={<StatusPedido />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
