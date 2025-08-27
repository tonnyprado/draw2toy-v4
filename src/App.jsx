import Home from "./frontend/cliente/pages/Home";
import BeforeToyPhoto from "./frontend/cliente/pages/BeforeToyPhoto";
import { Routes, Route, Navigate } from "react-router-dom";
import ToyPhoto from "./frontend/cliente/pages/ToyPhoto";
import Checkout from "./frontend/cliente/pages/Checkout";
import StatusPedido from "./frontend/cliente/pages/StatusPedido.jsx";
import Navbar from "./frontend/cliente/components/Navbar.jsx";
import Footer from "./frontend/cliente/components/Footer.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminNavbar from "./frontend/admin/components/AdminNavbar.jsx";
import Dashboard from "./frontend/admin/pages/Dashboard.jsx";
import Pedidos from "./frontend/admin/pages/Pedidos.jsx";
import Usuarios from "./frontend/admin/pages/Usuarios.jsx";

import Login from "./frontend/Login.jsx";
import SignUp from "./frontend/SignUp.jsx";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/before" element={<BeforeToyPhoto />} />
        <Route path="/toy-photo" element={<ToyPhoto />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/status/:ticketId" element={<StatusPedido />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />


        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <>
              <AdminNavbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        } />
        <Route path="/admin/pedidos" element={
          <ProtectedRoute requireAdmin>
            <>
              <AdminNavbar />
              <Pedidos />
            </>
          </ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedRoute requireAdmin>
            <>
              <AdminNavbar />
              <Usuarios />
            </>
          </ProtectedRoute>
        } />



        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
    
  );
}
