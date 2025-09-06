import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { uploadDesign } from "../../../backend/services/storageService";
import "../../../ui-design/pages/ToyPhoto.css";

/* === Sprites del fondo (tus PNGs) === */
import M1 from "../../../assets/no-background/blueguy.png";
import M2 from "../../../assets/no-background/redguy.png";
import M3 from "../../../assets/no-background/greenguy.png";
const SPRITES = [M1, M2, M3];

/* ===== Fondo animado ===== */
function AnimatedSprites({ count = 18 }) {
  const sprites = useMemo(() => {
    const rnd = (a, b) => Math.random() * (b - a) + a;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const rows = Math.ceil(count / 2);
    const out = [];
    for (let r = 0; r < rows && out.length < count; r++) {
      const t = rows > 1 ? r / (rows - 1) : 0;
      const eased = Math.pow(t, 1.6);
      const baseTop = 8 + 72 * eased;
      const topL = clamp(baseTop + rnd(-4, 4), 6, 82);
      const topR = clamp(baseTop + rnd(-4, 4), 6, 82);
      const common = () => ({
        size: `${rnd(170, 280)}px`,
        ampX: `${rnd(20, 36)}px`,
        swayDur: `${rnd(10, 16)}s`,
        bobDur: `${rnd(6, 9)}s`,
        twistDur: `${rnd(12, 18)}s`,
        delayList: `${-rnd(0, 6)}s, ${-rnd(0, 6)}s, ${-rnd(0, 8)}s`,
        flip: Math.random() > 0.5 ? -1 : 1,
        rotStart: `${rnd(-4, 4)}deg`,
        rotMid: `${rnd(-2, 2)}deg`,
      });
      if (out.length < count) {
        out.push({ src: SPRITES[out.length % SPRITES.length], left: `${rnd(2,24)}%`, top: `${topL}%`, ...common() });
      }
      if (out.length < count) {
        out.push({ src: SPRITES[out.length % SPRITES.length], left: `${rnd(76,98)}%`, top: `${topR}%`, ...common() });
      }
    }
    return out;
  }, [count]);

  return (
    <div className="bg-sprites" aria-hidden>
      {sprites.map((s, i) => (
        <img key={i} src={s.src} alt="" className="sprite"
          style={{
            left: s.left, top: s.top, width: s.size,
            "--ampX": s.ampX, "--swayDur": s.swayDur, "--bobDur": s.bobDur,
            "--twistDur": s.twistDur, "--flip": s.flip,
            "--rotStart": s.rotStart, "--rotMid": s.rotMid,
            animationDelay: s.delayList
          }}/>
      ))}
    </div>
  );
}

/* ======================= PÁGINA ======================= */
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

  /* -------- Slider (scroll-snap) -------- */
  const viewportRef = useRef(null);
  const [i, setI] = useState(0);
  const totalSlides = 4;
  const canNextFrom0 = !!photoFile;

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onScroll = () => setI(Math.round(vp.scrollLeft / vp.clientWidth));
    vp.addEventListener("scroll", onScroll, { passive: true });
    return () => vp.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (idx) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const clamped = Math.max(0, Math.min(totalSlides - 1, idx));
    vp.scrollTo({ left: clamped * vp.clientWidth, behavior: "smooth" });
    setI(clamped);
  };
  const next = () => goTo(i + (i === 0 ? (canNextFrom0 ? 1 : 0) : 1));
  const prev = () => goTo(i - 1);

  /* -------- Precio / carrito -------- */
  const price = useMemo(() => (size === "GRANDE" ? 899 : 499), [size]);
  const canSave = !!photoFile && qty > 0;
  const canCheckout = !!photoFile && qty > 0;

  /* -------- Imagen -------- */
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
      console.warn("[ToyPhoto] objectURL:", err);
    }
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = (file.type || "").toLowerCase();
    const nameF = (file.name || "").toLowerCase();
    const isImageLike = type.startsWith("image/") || nameF.endsWith(".heic") || nameF.endsWith(".heif");
    if (!isImageLike) {
      alert("Selecciona una imagen válida (JPG, PNG, HEIC/HEIF).");
      setTimeout(() => (e.target.value = null), 0);
      return;
    }
    setPreviewFromFile(file);
    setTimeout(() => (e.target.value = null), 0);
    // Si quieres auto-avanzar cuando eligen foto:
    // goTo(1);
  }

  function handleDrop(e) {
    e.preventDefault();
    if (saved) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const type = (file.type || "").toLowerCase();
    const nameF = (file.name || "").toLowerCase();
    const isImageLike = type.startsWith("image/") || nameF.endsWith(".heic") || nameF.endsWith(".heif");
    if (!isImageLike) { alert("Selecciona una imagen válida (JPG, PNG, HEIC/HEIF)."); return; }
    setPreviewFromFile(file);
  }
  const handleDragOver = (e) => e.preventDefault();

  /* ---- Click seguro en la dropzone ---- */
  const fileRef = useRef(null);
  const openFilePicker = () => {
    if (saved) return;
    fileRef.current?.click();
  };

  /* -------- Reset -------- */
  function resetForm() {
    clearObjectUrl();
    setPhotoFile(null); setPhotoPreview(null);
    setName(""); setDesc(""); setSize("STANDARD"); setQty(1);
    setSaved(false); setErrorMsg(null);
    goTo(0);
  }

  async function toCartItemAsync() {
    let remote = null;
    if (photoFile) {
      try { remote = await uploadDesign(photoFile, "custom-toys"); }
      catch (e) { console.warn("[ToyPhoto] upload:", e); }
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

  return (
    <div className="toyphoto-page">
      <AnimatedSprites count={18} />

      {/* Flechas */}
      <button className="nav-arrow nav-prev" onClick={prev} disabled={i === 0} aria-label="Anterior">‹</button>
      <button
        className="nav-arrow nav-next"
        onClick={next}
        disabled={i === 0 ? !photoFile : i >= totalSlides - 1}
        aria-label="Siguiente"
      >›</button>

      {/* Progreso */}
      <div className="slides-progress">
        <div className="dots">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              className={`dot ${i === idx ? "is-active" : ""}`}
              onClick={() => (idx === 0 ? goTo(0) : goTo(idx))}
              disabled={idx === 1 && !photoFile}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>
        <div className="step-text">Paso {i + 1} de {totalSlides}</div>
      </div>

      {/* Carrusel con scroll-snap */}
      <div className="slides-viewport" ref={viewportRef}>
        <div className="slides-row">
          {/* 0) Foto */}
          <section className="slide">
            <header className="slide-title">
              <h1 className="h1 rainbow-text wobble">Arma tu juguete</h1>
              <p className="muted big-sub">Sube la foto del dibujo para comenzar</p>
            </header>

            <div className="card-xl">
              <div
                className="dropzone"
                onClick={openFilePicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFilePicker()}
                aria-label="Zona para subir foto"
              >
                {photoPreview ? (
                  <img className="preview" src={photoPreview} alt="Vista previa del dibujo" />
                ) : (
                  <div className="dz-hint">
                    <p className="dz-title"><strong>Toca o arrastra tu imagen aquí</strong></p>
                    <p className="muted">Formatos: JPG, PNG, HEIC/HEIF</p>
                    {errorMsg ? <p style={{ color: "crimson", marginTop: 6 }}>{errorMsg}</p> : null}
                  </div>
                )}

                {/* Input real encima (click nativo + programático) */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleFileSelected}
                  disabled={saved}
                  className="file-input"
                  aria-label="Elegir imagen del dispositivo"
                />
              </div>
            </div>
          </section>

          {/* 1) Nombre */}
          <section className="slide">
            <header className="slide-title">
              <h2 className="h2">Nombre de tu peluche <span className="badge">Opcional</span></h2>
              <p className="muted big-sub">Algo corto y bonito, ej. “Dino de Alex”</p>
            </header>
            <div className="card-xl">
              <label className="field">
                <div className="h3">Nombre</div>
                <input
                  type="text" className="input big" value={name}
                  onChange={e => setName(e.target.value)} placeholder="Dino de Alex" disabled={saved}
                />
              </label>
            </div>
          </section>

          {/* 2) Descripción */}
          <section className="slide">
            <header className="slide-title">
              <h2 className="h2">Descripción <span className="badge">Opcional</span></h2>
              <p className="muted big-sub">Colores preferidos, detalles importantes…</p>
            </header>
            <div className="card-xl">
              <label className="field">
                <div className="h3">Descripción</div>
                <textarea
                  className="textarea big" rows={6} value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ej.: que sea azul, con estrellitas en la panza…" disabled={saved}
                />
              </label>
            </div>
          </section>

          {/* 3) Tamaño / Cantidad / Acciones */}
          <section className="slide">
            <header className="slide-title">
              <h2 className="h2">Tamaño y pedido</h2>
              <p className="muted big-sub">Ajusta medidas y cantidad</p>
            </header>

            <div className="card-xl grid-2">
              <div className="panel">
                <div className="h3">Tamaño</div>
                <div className="options">
                  <label className="opt">
                    <input type="radio" name="size" value="STANDARD"
                      checked={size === "STANDARD"} onChange={() => setSize("STANDARD")} disabled={saved}/>
                    Standard 30 cm (demo ${499})
                  </label>
                  <label className="opt">
                    <input type="radio" name="size" value="GRANDE"
                      checked={size === "GRANDE"} onChange={() => setSize("GRANDE")} disabled={saved}/>
                    Grande 50 cm (demo ${899})
                  </label>
                </div>

                <div className="h3" style={{ marginTop: 18 }}>Cantidad</div>
                <div className="qty">
                  <button type="button" className="btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={saved}>−</button>
                  <input className="input" type="number" min={1} value={qty}
                         onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
                         disabled={saved} style={{ width: 100, textAlign: "center" }}/>
                  <button type="button" className="btn" onClick={() => setQty(q => q + 1)} disabled={saved}>+</button>
                </div>
              </div>

              <div className="panel summary">
                <div className="h3">Resumen</div>
                <p className="muted">Precio unitario (demo): ${price}</p>
                <p className="muted">Total (demo): ${price * qty}</p>

                <div className="actions">
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
