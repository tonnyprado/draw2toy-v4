export default function Privacy(){
  return (
    <section className="container" style={{ padding: 16, maxWidth: 900 }}>
      <h1 className="h1" style={{ marginBottom: 10 }}>Aviso de Privacidad</h1>
      <p className="muted">Última actualización: {new Date().toLocaleDateString()}</p>

      <p style={{ marginTop: 16 }}>
        BLUNDY (la “Empresa”) trata datos personales con base en la Ley Federal de Protección de
        Datos Personales en Posesión de los Particulares (México). Utilizamos datos para: crear y
        gestionar pedidos, comunicarte avances y mejorar el servicio.
      </p>

      <h2 className="h2">Datos que tratamos</h2>
      <ul>
        <li>Datos de contacto: nombre, correo, teléfono.</li>
        <li>Datos de envío: domicilio y referencias.</li>
        <li>Datos de uso del sitio (analítica opcional, si aceptas).</li>
      </ul>

      <h2 className="h2">Finalidades</h2>
      <ul>
        <li>Procesar y entregar tu pedido.</li>
        <li>Soporte y seguimiento de tickets.</li>
        <li>Mejoras del producto (analítica opcional).</li>
      </ul>

      <h2 className="h2">Cookies</h2>
      <p>
        Usamos cookies necesarias para el funcionamiento del sitio y cookies opcionales de analítica y
        marketing sólo si otorgas tu consentimiento desde el banner de privacidad.
      </p>

      <h2 className="h2">Tus derechos</h2>
      <p>
        Puedes acceder, rectificar o solicitar la eliminación de tus datos escribiendo a
        <a href="mailto:hola@blundy.example"> hola@blundy.example</a>. También puedes cambiar tus
        preferencias de cookies en el botón “Privacidad” del sitio.
      </p>
    </section>
  );
}
