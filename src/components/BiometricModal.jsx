import { useEffect, useState } from "react";
import {
  X,
  Fingerprint,
  ScanFace,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

function BiometricModal({ method, onSuccess, onClose }) {
  const [status, setStatus] = useState("scanning");

  const isFingerprint = method === "fingerprint";
  const title = isFingerprint
    ? "Autenticación con huella"
    : "Reconocimiento facial";

  useEffect(() => {
    setStatus("scanning");

    const scanTimer = setTimeout(() => {
      setStatus("success");
    }, 2500);

    const loginTimer = setTimeout(() => {
      onSuccess();
    }, 4000);

    return () => {
      clearTimeout(scanTimer);
      clearTimeout(loginTimer);
    };
  }, [method, onSuccess]);

  const Icon = isFingerprint ? Fingerprint : ScanFace;

  return (
    <div
      className="biometric-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="biometric-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="biometric-title"
      >
        <button
          type="button"
          className="biometric-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={21} />
        </button>

        <div className="biometric-security-badge">
          <ShieldCheck size={17} />
          <span>ACCESO SEGURO</span>
        </div>

        <div
          className={`biometric-scan-icon ${
            status === "success" ? "biometric-success" : ""
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 size={66} strokeWidth={1.5} />
          ) : (
            <Icon size={72} strokeWidth={1.4} />
          )}

          {status === "scanning" && <span className="biometric-scan-ring" />}
        </div>

        <h2 id="biometric-title">
          {status === "success" ? "¡Autenticación exitosa!" : title}
        </h2>

        <p className="biometric-description">
          {status === "success"
            ? "Tu identidad ha sido verificada correctamente."
            : isFingerprint
              ? "Coloca tu dedo en el sensor para continuar."
              : "Mira hacia la cámara para continuar."}
        </p>

        {status === "scanning" ? (
          <>
            <div className="biometric-progress">
              <span />
            </div>
            <p className="biometric-status">
              {isFingerprint
                ? "Verificando huella digital..."
                : "Analizando rostro..."}
            </p>
          </>
        ) : (
          <div className="biometric-success-message">
            <CheckCircle2 size={18} />
            <span>Accediendo a EsSalud Digital...</span>
          </div>
        )}

        <button type="button" className="biometric-cancel" onClick={onClose}>
          Cancelar
        </button>

        <p className="biometric-demo-note">
          Simulación demostrativa · No utiliza sensores reales
        </p>
      </section>
    </div>
  );
}

export default BiometricModal;
