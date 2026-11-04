
import { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";

function LecturaVoz() {
  const [abierto, setAbierto] = useState(false);

  const {
    lecturaVoz,
    leerTexto,
    pausarLectura,
    reanudarLectura,
    detenerLectura,
  } = useAccessibility();

  // Si la función está desactivada, no mostrar el botón
  if (!lecturaVoz) return null;

  const leerPantalla = () => {
    const pantalla =
      document.querySelector(".phone-screen-content main") ||
      document.querySelector(".phone-screen-content .screen") ||
      document.querySelector(".phone-screen-content");

    if (!pantalla) return;

    // Copiamos el contenido para excluir los controles de lectura
    const copia = pantalla.cloneNode(true);

    copia.querySelectorAll(
      "nav, script, style, .lectura-voz"
    ).forEach((elemento) => elemento.remove());

    const texto = copia.innerText
      .replace(/\s+/g, " ")
      .trim();

    if (texto) {
      leerTexto(texto);
    }
  };

  const detenerYcerrar = () => {
    detenerLectura();
    setAbierto(false);
  };

  return (
    <div className="lectura-voz">
      {abierto && (
        <div className="lectura-voz-panel">
          <div className="lectura-voz-header">
            <div>
              <strong>Lectura en voz alta</strong>
              <p>Controla la reproducción</p>
            </div>

            <button
              type="button"
              className="lectura-voz-cerrar"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar controles"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            className="lectura-voz-accion principal"
            onClick={leerPantalla}
          >
            <span>▶</span>
            Leer pantalla
          </button>

          <div className="lectura-voz-controles">
            <button
              type="button"
              className="lectura-voz-accion"
              onClick={pausarLectura}
            >
              <span>Ⅱ</span>
              Pausar
            </button>

            <button
              type="button"
              className="lectura-voz-accion"
              onClick={reanudarLectura}
            >
              <span>▶</span>
              Reanudar
            </button>
          </div>

          <button
            type="button"
            className="lectura-voz-detener"
            onClick={detenerYcerrar}
          >
            <span>■</span>
            Detener lectura
          </button>
        </div>
      )}

      <button
        type="button"
        className={`lectura-voz-boton ${abierto ? "activo" : ""}`}
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? "Cerrar lectura en voz alta" : "Abrir lectura en voz alta"}
        aria-expanded={abierto}
      >
        <span className="lectura-voz-icono">🔊</span>
      </button>
    </div>
  );
}

export default LecturaVoz;
