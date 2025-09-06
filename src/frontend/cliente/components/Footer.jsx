// src/frontend/cliente/components/Footer.jsx
import "../../../ui-design/motion/Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer footer-large">
      {/* (Ocultamos la onda si existiera) */}
      <div className="footer-wave" aria-hidden="true" />

      <div className="container footer-top">
        {/* Bloque hero (izquierda) */}
        <div className="footer-hero">
          <h2 className="footer-hero-title">
            Convierte dibujos en<br />peluches que se<br />abrazan.
          </h2>
          <p className="footer-hero-sub">
            Hecho para mamás y papás: proceso claro, materiales suaves y acompañamiento en
            cada paso.
          </p>

          <div className="footer-cta">
            <Link to="/before" className="btn btn-primary btn-lg">
              Empezar&nbsp;aquí
            </Link>
            <Link to="/contact" className="btn btn-ghost btn-lg">
              Contacto
            </Link>
          </div>
        </div>

        {/* Columnas (derecha) */}
        <div className="footer-columns">
          <div className="footer-col">
            <h5 className="footer-col-title">ENLACES</h5>
            <ul className="footer-list">
              <li><Link to="/toy-photo">Ordenar</Link></li>
              <li><Link to="/before">Acerca de</Link></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">RECURSOS</h5>
            <ul className="footer-list">
              <li><Link to="/privacy">Políticas</Link></li>
              <li><a href="#">Términos</a></li>
              <li><a href="#">Soporte</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">SOCIAL</h5>
            <div className="social-row">
              <a className="social" href="#" aria-label="Instagram"><InstagramIcon/></a>
              <a className="social" href="#" aria-label="TikTok"><TiktokIcon/></a>
              <a className="social" href="#" aria-label="YouTube"><YoutubeIcon/></a>
              <a className="social" href="#" aria-label="Facebook"><FacebookIcon/></a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <small>© {year} Draw2Toy — Todos los derechos reservados</small>
          <div className="footer-links">
            <Link to="/privacy">Políticas</Link>
            <a href="#">Términos</a>
            <a href="#">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ====== Íconos SVG ====== */
function InstagramIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
    </svg>
  );
}
function TiktokIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 4v7.5a4.5 4.5 0 11-3.2 7.7A4.5 4.5 0 0110 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 4c.6 2 2.3 3.4 4.5 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function YoutubeIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M11 10l5 2-5 2v-4z" fill="currentColor"/>
    </svg>
  );
}
function FacebookIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 8h3V5h-3a4 4 0 00-4 4v3H7v3h3v6h3v-6h3l1-3h-4V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}
