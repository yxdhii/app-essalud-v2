import { useEffect } from "react";

import dniCaracter1 from "../assets/dni-caracter-verificador-1.png";
import dniCaracter2 from "../assets/dni-caracter-verificador-2.png";

export default function VerificationCharacterModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="verification-modal-overlay"
      onClick={onClose}
    >
      <section
        className="verification-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="verification-close-icon"
          onClick={onClose}
          aria-label="Cerrar ventana"
        >
          ×
        </button>

        <header className="verification-modal-header">
          <h2 id="verification-title">
            Carácter Verificador
          </h2>

          <p className="verification-description">
            Es el número ubicado en la esquina superior derecha
            de tu documento, después de los ocho números que
            conforman tu DNI.
          </p>
        </header>

        <div className="verification-images">
          <img
            src={dniCaracter1}
            alt="Ejemplo de ubicación del carácter verificador en el DNI"
          />

          <img
            src={dniCaracter2}
            alt="Segundo ejemplo de ubicación del carácter verificador en el DNI"
          />
        </div>

        <footer className="verification-footer">
          <button
            type="button"
            className="verification-close-button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}