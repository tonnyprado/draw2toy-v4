// Login.jsx (ejemplo rápido)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, pass);
    nav("/");
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="password" />
      <button>Entrar</button>
    </form>
  );
}
