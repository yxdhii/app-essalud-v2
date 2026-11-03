
import React from "react";
import { CircleHelp } from "lucide-react";

export default function ConfirmacionModal({
  isOpen,
  title = "¿Estás seguro de continuar?",
  message,
  onCancel,
  onConfirm,
  cancelText = "No",
  confirmText = "Sí",
  variant = "confirm",
}) {
  if (!isOpen) return null;

  const esAyuda = variant === "help";

  const cerrarModal = onCancel || onConfirm;

  return (
    <div
  className={`logout-confirm-overlay ${
    esAyuda ? "help-modal-overlay" : ""
  }`}
  onClick={cerrarModal}
>
      <div
        className="logout-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {esAyuda && (
          <div className="help-modal-icon">
            <CircleHelp size={27} />
          </div>
        )}

        <h2 id="confirmacion-modal-title">
          {title}
        </h2>

        {message && <p>{message}</p>}

        <div className="logout-confirm-actions">
          {esAyuda ? (
            <button
              type="button"
              className="logout-accept-button"
              onClick={cerrarModal}
            >
              {confirmText || "Entendido"}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="logout-cancel-button"
                onClick={onCancel}
              >
                {cancelText}
              </button>

              <button
                type="button"
                className="logout-accept-button"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
