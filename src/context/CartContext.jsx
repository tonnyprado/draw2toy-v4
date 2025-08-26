import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart:v4") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart:v4", JSON.stringify(items));
  }, [items]);

  const add = (p) => setItems((xs) => {
    const i = xs.findIndex(it => it.id === p.id);
    if (i >= 0) {
      const copy = xs.slice();
      copy[i] = { ...copy[i], qty: copy[i].qty + (p.qty || 1) };
      return copy;
    }
    return [...xs, { ...p, qty: p.qty || 1 }];
  });

  const updateQty = (id, qty) =>
    setItems((xs) => xs.map(it => it.id === id ? { ...it, qty: Math.max(1, qty) } : it));

  const remove = (id) => setItems((xs) => xs.filter(it => it.id !== id));
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, it) => s + (it.price || 0) * it.qty, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, add, updateQty, remove, clear, count, total }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
