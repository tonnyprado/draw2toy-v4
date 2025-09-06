import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import "../../../ui-design/pages/Home.css";
import sampleVideo from "../../../ui-design/assets/littlegirlsample.mp4";

/* ---------- Canvas de ESTRELLAS DE MAR (crayola) ---------- */
function StarfishCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // Fuerza animación aunque el sistema tenga "Reduce motion"
  const RESPECT_PREFERS_REDUCED_MOTION = false;

  function makeRNG(seed = 2025) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Detecta reduce motion pero lo ignora si RESPECT_PREF... = false
    let reduceMotion = false;
    if (RESPECT_PREFERS_REDUCED_MOTION && window.matchMedia) {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    let width = 0, height = 0, dpr = 1;
    const rng = makeRNG(77);

    const palette = ["#FF6B6B", "#B28DFF", "#2EC4B6", "#FFD93D", "#6C63FF"];

    const stars = []; // {x,y,s,rot,color,phase,amp,rotAmp}

    const crayonStroke = (drawPath, color, lineWidth=7, passes=4, alpha=0.95) => {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let i=0; i<passes; i++){
        ctx.globalAlpha = alpha * (0.7 + i*0.1);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * (0.9 + i*0.05);
        ctx.beginPath();
        drawPath((x,y)=>[
          x + (i ? (rng()-0.5)*1.3 : 0),
          y + (i ? (rng()-0.5)*1.3 : 0)
        ]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawStarfish = (cx, cy, size, rot, color) => {
      const arms = 5;
      const inner = size * 0.44;

      const path = (p) => {
        for (let i=0; i<arms; i++) {
          const a0 = rot + (i * (Math.PI*2/arms));
          const a1 = a0 + Math.PI*2/arms/2;
          const x0 = cx + Math.cos(a0) * inner;
          const y0 = cy + Math.sin(a0) * inner;
          const x1 = cx + Math.cos(a0) * size;
          const y1 = cy + Math.sin(a0) * size;
          const x2 = cx + Math.cos(a1) * inner;
          const y2 = cy + Math.sin(a1) * inner;

          if (i === 0) ctx.moveTo(...p(x0,y0));
          ctx.lineTo(...p(x1,y1));
          ctx.lineTo(...p(x2,y2));
        }
        ctx.closePath();
      };

      // trazo crayola
      crayonStroke(path, color, 8, 4, 0.95);

      // relleno tenue
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      ctx.beginPath();
      path((x,y)=>[x,y]);
      ctx.fill();
      ctx.restore();
    };

    function placeStars(){
      stars.length = 0;
      // Más grandes/visibles y un poco más numerosas
      const densityBase = 18;
      const scale = Math.max(1, (width*height) / (1280*800));
      const N = Math.round(densityBase * Math.sqrt(scale)); // escala suave
      for (let i=0; i<N; i++){
        const s = 36 + rng()*64;              // tamaño ↑
        const x = rng()*width;
        const y = rng()*height;
        const rot = rng()*Math.PI*2;
        const color = palette[i % palette.length];
        const phase = rng()*Math.PI*2;
        const amp = 10 + rng()*18;            // amplitud ↑
        const rotAmp = 0.10 + rng()*0.08;     // rotación ↑
        stars.push({x,y,s,rot,color,phase,amp,rotAmp});
      }
    }

    function resize(){
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      dpr = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      placeStars();
    }

    function draw(ts = 0){
      ctx.clearRect(0,0,width,height);
      const t = ts/1000;

      stars.forEach(st => {
        const bob = reduceMotion ? 0 : Math.sin(t*0.7 + st.phase) * st.amp;
        const rot = reduceMotion ? st.rot : st.rot + Math.sin(t*0.35 + st.phase)*st.rotAmp;
        drawStarfish(st.x, st.y + bob, st.s, rot, st.color);
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="bg-canvas" ref={canvasRef} aria-hidden="true" />;
}
/* ---------- fin Canvas ---------- */

export default function Home() {
  const featureBlocks = [
    { id: 1, title: "Dibujo ➜ Peluche", desc: "Convierte un dibujo infantil en un juguete real paso a paso.", img: "https://placehold.co/1200x900?text=Imagen+1" },
    { id: 2, title: "Proceso guiado",   desc: "Sube el dibujo, completa preferencias y revisa el estado del pedido.", img: "https://placehold.co/1200x900?text=Imagen+2" },
    { id: 3, title: "Revisiones",       desc: "Habrá revisiones antes de la producción final para asegurar calidad.", img: "https://placehold.co/1200x900?text=Imagen+3" },
    { id: 4, title: "Entrega",          desc: "Recibe el peluche terminado con guía de rastreo.",                 img: "https://placehold.co/1200x900?text=Imagen+4" },
  ];

  const videoSrc = sampleVideo;
  const hasVideo = useMemo(() => Boolean(videoSrc), [videoSrc]);

  // Reveal
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Parallax suave decoraciones del hero
  useEffect(() => {
    const cloud = document.querySelector(".hero .cloud");
    const bubble = document.querySelector(".hero .bubble");
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (cloud)  cloud.style.transform  = `translateY(${y * 0.06}px)`;
      if (bubble) bubble.style.transform = `translateY(${y * 0.04}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Navbar: transparente arriba → clara al scrollear
  useEffect(() => {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y < 40) { nav.classList.add("is-top"); nav.classList.remove("is-scrolled"); }
      else { nav.classList.remove("is-top"); nav.classList.add("is-scrolled"); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-home">
      {/* Fondo de estrellas de mar con crayola (fijo) */}
      <StarfishCanvas />

      <div className="landing-content">
        {/* HERO */}
        <section className={`hero hero--full ${hasVideo ? "has-video" : ""}`}>
          {hasVideo && (
            <video
              autoPlay loop muted playsInline
              src={videoSrc}
              aria-label="Video de fondo"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            />
          )}

          <div className="cloud" />
          <div className="bubble" />

          <div className="container" style={{
            position: "relative", zIndex: 2, minHeight: "100vh",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", color: hasVideo ? "#fff" : "var(--text)"
          }}>
            <h1 className="h1 wobble reveal" style={{ margin: 0 }}>
              Convierte sus dibujos en juguetes
            </h1>
            <p className="reveal" d-1 style={{ marginTop: 10, fontSize: 18, opacity: .95 }}>
              Sube un dibujo y empieza en segundos.
            </p>
            <div className="flex gap-4" style={{ marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/before" className="btn btn-primary btn-hero floaty reveal" d-2>
                Comienza creando tu juguete aquí
              </Link>
              <Link to="/signup" className="btn btn-secondary reveal" d-3>
                Registrarme
              </Link>
            </div>
          </div>
        </section>

        {/* CITA */}
        <section className="section-pastel fullvh center">
          <div className="container">
            <p className="reveal" style={{ fontSize: 22, lineHeight: 1.5, textAlign: "center" }}>
              “Estudios sugieren que el juego con juguetes estimula la creatividad, la resolución de problemas
              y fortalece el vínculo emocional entre niños y familia.”
            </p>
          </div>
        </section>

        {/* FEATURES */}
        {featureBlocks.map((b, idx) => (
          <section key={b.id} className="section-pastel fullvh">
            <div className="container" style={{ display: "flex", alignItems: "center", minHeight: "100%" }}>
              <div
                className="grid gap-8"
                style={{ width: "100%", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}
              >
                <div style={{ order: idx % 2 === 0 ? 0 : 1 }}>
                  <div className="reveal" d-1 style={{ overflow: "hidden", borderRadius: 20, border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <img
                      src={b.img}
                      alt={b.title}
                      style={{ display: "block", width: "100%", height: 420, objectFit: "cover" }}
                    />
                  </div>
                </div>

                <div style={{ order: idx % 2 === 0 ? 1 : 0 }}>
                  <h2 className="h2 reveal">{b.title}</h2>
                  <p className="muted reveal" d-2 style={{ fontSize: 18 }}>{b.desc}</p>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA final */}
        <section className="section-pastel tall center">
          <div className="container reveal" style={{ textAlign: "center" }}>
            <h2 className="h2" style={{ marginTop: 0 }}>¿Listo para empezar?</h2>
            <p className="muted">Crea tu primer juguete en menos de 2 minutos.</p>
            <div className="flex gap-4" style={{ justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/before" className="btn btn-primary btn-hero floaty">Comienza a crear ahora con un solo click</Link>
              <Link to="/signup" className="btn btn-secondary">Registrarme</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
