// src/frontend/pages/ToyPhoto.jsx
import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { uploadDesign } from "../../../backend/services/storageService";

// 🎨 estilos locales de la página (fondo pastel fijo + legibilidad)
import "../../../ui-design/pages/ToyPhoto.css";

export default function ToyPhoto() {
  const { add } = useCart();
  const navigate = useNavigate();

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("STANDARD");
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const objectUrlRef = useRef(null);

  const price = useMemo(() => (size === "GRANDE" ? 899 : 499), [size]);
  const canSave = !!photoFile && qty > 0;
  const canCheckout = !!photoFile && qty > 0;

  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function setPreviewFromFile(file) {
    setErrorMsg(null);
    clearObjectUrl();
    try {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPhotoPreview(url);
      setPhotoFile(file);
      setSaved(false);
    } catch (err) {
      setPhotoPreview(null);
      setPhotoFile(file);
      setSaved(false);
      setErrorMsg("No se pudo previsualizar la imagen, pero el archivo sí se cargó.");
      console.warn("[ToyPhoto] Error creando objectURL:", err);
    }
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    const isImageLike = type.startsWith("image/") || name.endsWith(".heic") || name.endsWith(".heif");
    if (!isImageLike) {
      alert("Selecciona una imagen válida (JPG, PNG, HEIC/HEIF).");
      setTimeout(() => (e.target.value = null), 0);
      return;
    }
    setPreviewFromFile(file);
    setTimeout(() => (e.target.value = null), 0);
  }

  function handleDrop(e) {
    e.preventDefault();
    if (saved) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    const isImageLike = type.startsWith("image/") || name.endsWith(".heic") || name.endsWith(".heif");
    if (!isImageLike) {
      alert("Selecciona una imagen válida (JPG, PNG, HEIC/HEIF).");
      return;
    }
    setPreviewFromFile(file);
  }
  function handleDragOver(e) { e.preventDefault(); }

  function resetForm() {
    clearObjectUrl();
    setPhotoFile(null); setPhotoPreview(null);
    setName(""); setDesc(""); setSize("STANDARD"); setQty(1);
    setSaved(false); setErrorMsg(null);
  }

  async function toCartItemAsync() {
    let remote = null;
    if (photoFile) {
      try {
        remote = await uploadDesign(photoFile, "custom-toys");
      } catch (e) {
        console.warn("[ToyPhoto] Upload deshabilitado o falló, seguimos con preview local:", e);
      }
    }
    const id = `custom-${Date.now()}`;
    return {
      id, type: "CUSTOM_TOY",
      name: name.trim() || "Juguete sin nombre",
      description: desc.trim() || undefined,
      size,
      imageUrl: remote?.url || null,
      photoPreview,
      price,
      qty,
    };
  }

  async function handleSaveToCart() {
    if (!canSave) return alert("Necesitas subir una foto y elegir cantidad.");
    add(await toCartItemAsync());
    setSaved(true);
    alert("Diseño guardado en el carrito. Puedes agregar otro o proceder al pago.");
  }

  async function handleCheckout() {
    if (!canCheckout) return alert("Completa la foto y la cantidad antes de continuar.");
    if (!saved) add(await toCartItemAsync());
    navigate("/checkout");
  }

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="toyphoto-page">
      <section className="container" style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
        <h1 className="h1 wobble reveal" style={{ marginBottom: 12 }}>Arma tu juguete</h1>

        <div className="card reveal" d-1 style={{ padding: 0 }}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
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
            aria-label="Zona para subir la foto (toca para elegir o arrastra)"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Vista previa del dibujo"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                  pointerEvents: "none"
                }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 16, pointerEvents: "none" }}>
                <p style={{ margin: 0 }}><strong>Sube la foto del dibujo</strong></p>
                <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                  Toca el área para elegir (móvil) o arrastra y suelta (desktop).<br />
                  Formatos: JPG, PNG, HEIC/HEIF
                </p>
                {errorMsg ? <p style={{ color: "crimson", marginTop: 6 }}>{errorMsg}</p> : null}
              </div>
            )}

            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileSelected}
              disabled={saved}
              aria-label="Elegir imagen del dispositivo"
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: saved ? "default" : "pointer"
              }}
            />
          </div>
        </div>

        {/* Nombre y descripción */}
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

        {/* Tamaño */}
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

        {/* Cantidad */}
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

        {/* Resumen */}
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
              <button type="button" className="btn" onClick={handleSaveToCart}>
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
    </div>
  );
}
