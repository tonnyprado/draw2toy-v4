// src/frontend/pages/ToyPhoto.jsx
import { useState, useRef, useMemo } from "react";
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

  const [saved, setSaved] = useState(false);   // bloquea edición tras guardar
  const fileInputRef = useRef(null);

  // Precios de demo (reemplazar por reales)
  const price = useMemo(() => (size === "GRANDE" ? 899 : 499), [size]);

  // ⚠️ Temporal: no exigimos foto para poder avanzar (solo para demo)
  const canSave = qty > 0;
  const canCheckout = qty > 0;
  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function resetForm() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setName("");
    setDesc("");
    setSize("STANDARD");
    setQty(1);
    setSaved(false);
  }

  function toCartItem() {
    const id = `custom-${Date.now()}`; // id temporal para el carrito
    return {
      id,
      type: "CUSTOM_TOY",
      name: name.trim() || "Juguete sin nombre",
      description: desc.trim() || undefined,
      size,                      // STANDARD | GRANDE
      photoPreview,              // solo para front: vista previa
      price,                     // placeholder
      qty,
    };
  }

  function handleSaveToCart() {
    if (!canSave) {
      alert("Necesitas subir una foto y elegir cantidad.");
      return;
    }
    add(toCartItem());
    setSaved(true);
    alert("Diseño guardado en el carrito. Puedes agregar otro o proceder al pago.");
  }

  function handleCheckout() {
    if (!canCheckout) {
      alert("Completa la foto y la cantidad antes de continuar.");
      return;
    }
    // Opcional: agrega al carrito si aún no lo guardaron
    if (!saved) add(toCartItem());
    navigate("/checkout");
  }

  return (
    <section style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Arma tu juguete</h1>

      {/* 1) Foto (drag & drop + selector) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handlePickFile}
        style={{
          border: "2px dashed #bbb",
          borderRadius: 8,
          height: 280,
          display: "grid",
          placeItems: "center",
          marginBottom: 12,
          background: "#fafafa",
          position: "relative",
          cursor: "pointer",
        }}
      >
        {photoPreview ? (
            <div
                style={{
                width: "100%",
                height: 280,          // alto fijo del cuadro
                overflow: "hidden",   // evita que “crezca” el layout
                }}
            >
                <img
                    src={photoPreview}
                    alt="Vista previa del dibujo"
                    style={{ width: "100%", height:"100%", objectFit: "contain", display: "block", }}
                />
            </div>
          
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0 }}><strong>Arrastra y suelta</strong> aquí la foto del dibujo</p>
            <p style={{ margin: "6px 0" }}>o</p>
            <button type="button" onClick={handlePickFile}>Elegir desde tu dispositivo</button>
            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
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

      {/* 2) Nombre (opcional) + 3) Descripción (opcional) */}
      <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        <label>
          Nombre del juguete (opcional)
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej.: Dino de Alex"
            disabled={saved}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          Descripción (opcional)
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Detalles, colores preferidos, puntos importantes…"
            disabled={saved}
            rows={4}
            style={{ width: "100%", padding: 8, marginTop: 6, resize: "vertical" }}
          />
        </label>
      </div>

      {/* 4) Tamaño */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 6 }}>Tamaño</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
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
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
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
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 6 }}>Cantidad</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={saved}>-</button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
            disabled={saved}
            style={{ width: 64, textAlign: "center" }}
          />
          <button type="button" onClick={() => setQty(q => q + 1)} disabled={saved}>+</button>
        </div>
      </div>

      {/* Resumen mínimo */}
      <div style={{ margin: "12px 0", fontSize: 14, opacity: 0.9 }}>
        <div>Precio unitario (demo): ${price}</div>
        <div>Total (demo): ${price * qty}</div>
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        {!saved ? (
          <>
            <button type="button" onClick={handleSaveToCart} disabled={!canSave}>
              Guardar en el carrito
            </button>
            <button type="button" onClick={handleCheckout} disabled={!canCheckout}>
              Proceder a la compra
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setSaved(false)}>
              Editar este diseño
            </button>
            <button
              type="button"
              onClick={() => {
                // Re-guardar creará otro item (hasta que implementemos update/remove en el carrito)
                handleSaveToCart();
              }}
            >
              Actualizar diseño en carrito
            </button>
            <button type="button" onClick={() => navigate("/checkout")}>
              Ir al carrito / Checkout
            </button>
          </>
        )}

        <button type="button" onClick={resetForm}>
          Guardar otro diseño (limpiar formulario)
        </button>
      </div>
    </section>
  );
}
