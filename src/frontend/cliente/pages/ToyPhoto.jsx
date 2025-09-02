// src/frontend/pages/ToyPhoto.jsx
import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

export default function ToyPhoto() {
  const { add } = useCart();
  const navigate = useNavigate();

  // Estado del formulario
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("STANDARD"); // STANDARD | GRANDE
  const [qty, setQty] = useState(1);

  const [saved, setSaved] = useState(false); // bloquea edición tras guardar
  const fileInputRef = useRef(null);

  // Precios demo
  const price = useMemo(() => (size === "GRANDE" ? 899 : 499), [size]);

  const canSave = qty > 0;      // por ahora no exigimos foto
  const canCheckout = qty > 0;

  function handlePickFile() { fileInputRef.current?.click(); }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Selecciona una imagen válida");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Selecciona una imagen válida");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }
  function handleDragOver(e) { e.preventDefault(); }

  function resetForm() {
    setPhotoFile(null); setPhotoPreview(null);
    setName(""); setDesc(""); setSize("STANDARD"); setQty(1);
    setSaved(false);
  }

  function toCartItem() {
    const id = `custom-${Date.now()}`;
    return {
      id, type: "CUSTOM_TOY",
      name: name.trim() || "Juguete sin nombre",
      description: desc.trim() || undefined,
      size,
      photoPreview,      // preview local (solo para UI)
      price,
      qty,
    };
  }

  function handleSaveToCart() {
    if (!canSave) return alert("Necesitas subir una foto y elegir cantidad.");
    add(toCartItem());
    setSaved(true);
    alert("Diseño guardado en el carrito. Puedes agregar otro o proceder al pago.");
  }

  function handleCheckout() {
    if (!canCheckout) return alert("Completa la foto y la cantidad antes de continuar.");
    if (!saved) add(toCartItem());
    navigate("/checkout");
  }

  // Reveal on scroll
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="container" style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h1 className="h1 wobble reveal" style={{ marginBottom: 12 }}>Arma tu juguete</h1>

      {/* 1) Foto (drag & drop + selector) */}
      <div className="card reveal" d-1 style={{ padding: 0 }}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handlePickFile}
          style={{
            border: "3px dashed var(--border)",
            borderRadius: "var(--radius-xl)",
            height: 300,
            display: "grid",
            placeItems: "center",
            background: "#fff",
            position: "relative",
            cursor: saved ? "default" : "pointer",
            overflow: "hidden"
          }}
          aria-label="Zona para subir la foto (arrastra o haz click)"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Vista previa del dibujo"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 16 }}>
              <p style={{ margin: 0 }}><strong>Arrastra y suelta</strong> aquí la foto del dibujo</p>
              <p style={{ margin: "6px 0" }}>o</p>
              <button type="button" className="btn btn-primary" onClick={handlePickFile} disabled={saved}>
                Elegir desde tu dispositivo
              </button>
              <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Formatos soportados: JPG, PNG, HEIC (según navegador)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            style={{ display: "none" }}
            disabled={saved}
          />
        </div>
      </div>

      {/* 2) Nombre + 3) Descripción */}
      <div className="grid gap-6 mt-6 reveal" d-2>
        <label>
          <div className="h3">Nombre del juguete (opcional)</div>
          <input
            type="text"
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej.: Dino de Alex"
            disabled={saved}
            style={{ marginTop: 6 }}
          />
        </label>

        <label>
          <div className="h3">Descripción (opcional)</div>
          <textarea
            className="textarea"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Detalles, colores preferidos, puntos importantes…"
            disabled={saved}
            rows={4}
            style={{ marginTop: 6, resize: "vertical" }}
          />
        </label>
      </div>

      {/* 4) Tamaño */}
      <div className="mt-6 reveal" d-2>
        <div className="h3" style={{ marginBottom: 6 }}>Tamaño</div>
        <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="radio"
              name="size"
              value="STANDARD"
              checked={size === "STANDARD"}
              onChange={() => setSize("STANDARD")}
              disabled={saved}
            />
            Standard 30 cm (demo ${499})
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="radio"
              name="size"
              value="GRANDE"
              checked={size === "GRANDE"}
              onChange={() => setSize("GRANDE")}
              disabled={saved}
            />
            Grande 50 cm (demo ${899})
          </label>
        </div>
      </div>

      {/* 5) Cantidad */}
      <div className="mt-6 reveal" d-2>
        <div className="h3" style={{ marginBottom: 6 }}>Cantidad</div>
        <div className="flex items-center gap-4" style={{ flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={saved}>−</button>
          <input
            className="input"
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
            disabled={saved}
            style={{ width: 90, textAlign: "center" }}
          />
          <button type="button" className="btn" onClick={() => setQty(q => q + 1)} disabled={saved}>+</button>
        </div>
      </div>

      {/* Resumen mínimo */}
      <div className="mt-6 muted reveal">
        <div>Precio unitario (demo): ${price}</div>
        <div>Total (demo): ${price * qty}</div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex gap-4 reveal" d-3 style={{ flexWrap: "wrap" }}>
        {!saved ? (
          <>
            <button type="button" className="btn" onClick={handleSaveToCart} disabled={!canSave}>
              Guardar en el carrito
            </button>
            <button type="button" className="btn btn-primary floaty" onClick={handleCheckout} disabled={!canCheckout}>
              Proceder a la compra
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn" onClick={() => setSaved(false)}>
              Editar este diseño
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => { handleSaveToCart(); }}
            >
              Actualizar diseño en carrito
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/checkout")}>
              Ir al carrito / Checkout
            </button>
          </>
        )}

        <button type="button" className="btn btn-ghost" onClick={resetForm}>
          Guardar otro diseño (limpiar formulario)
        </button>
      </div>
    </section>
  );
}
