
import { useEffect, useState } from "react";

import {
  X,
  Fingerprint,
  ScanFace,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import {
  verificarBiometriaSimulada,
} from "../services/usuariosService.js";

function BiometricModal({
  method,
  dni,
  nombre,
  onSuccess,
  onClose,
}) {
  const [status, setStatus] = useState("scanning");
  const [mensaje, setMensaje] = useState("");

  const isFingerprint = method === "fingerprint";

  const title = isFingerprint
    ? "Autenticación con huella"
    : "Reconocimiento facial";

  const Icon = isFingerprint ? Fingerprint : ScanFace;

  // ============================================
  // VERIFICACIÓN BIOMÉTRICA
  // ============================================

  useEffect(() => {
    let cancelado = false;
    let successTimer;

    const verificationTimer = setTimeout(() => {
      if (cancelado) return;

      const resultado = verificarBiometriaSimulada(
        dni,
        method
      );

      if (!resultado.correcto) {
        setStatus("error");
        setMensaje(resultado.mensaje);
        return;
      }

      setStatus("success");
      setMensaje(
        "Tu identidad ha sido verificada correctamente."
      );

      successTimer = setTimeout(() => {
        if (!cancelado) {
          onSuccess();
        }
      }, 1200);

    }, 2500);

    return () => {
      cancelado = true;
      clearTimeout(verificationTimer);
      clearTimeout(successTimer);
    };
  }, [dni, method, onSuccess]);

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="biometric-modal-overlay">

      <div
        className="biometric-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="biometric-title"
      >

        {/* BOTÓN CERRAR */}
        <button
          type="button"
          className="biometric-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={21} />
        </button>

        {/* ICONO BIOMÉTRICO */}
        <div
          className={`biometric-modal-icon ${
            status === "scanning" ? "scanning" : status
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 size={48} />
          ) : status === "error" ? (
            <AlertCircle size={48} />
          ) : (
            <Icon size={48} />
          )}
        </div>

        {/* TÍTULO */}
        <h2 id="biometric-title">
          {status === "scanning"
            ? title
            : status === "success"
              ? "¡Verificación exitosa!"
              : "No se pudo verificar"}
        </h2>

        {/* NOMBRE DEL USUARIO */}
        {nombre && status === "scanning" && (
          <p className="biometric-modal-name">
            {nombre}
          </p>
        )}

        {/* ESTADO DE VERIFICACIÓN */}
        {status === "scanning" && (
          <>
            <p className="biometric-description">
              Estamos realizando la verificación de tu identidad.
            </p>

            <small className="biometric-status-text">
              Verificando identidad...
            </small>
          </>
        )}

        {/* VERIFICACIÓN EXITOSA */}
        {status === "success" && (
          <div className="biometric-result success">
            <ShieldCheck size={21} />

            <p>{mensaje}</p>

            <small>
              Ingresando a EsSalud Digital...
            </small>
          </div>
        )}

        {/* ERROR DE VERIFICACIÓN */}
        {status === "error" && (
          <div className="biometric-result error">
            <AlertCircle size={21} />

            <p>{mensaje}</p>

            <button
              type="button"
              onClick={onClose}
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {/* CANCELAR */}
        {status === "scanning" && (
          <button
            type="button"
            className="biometric-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
        )}

      </div>
    </div>
  );
}

export default BiometricModal;
