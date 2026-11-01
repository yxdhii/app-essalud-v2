
import React from "react";

export default function ConfirmacionModal({
  isOpen,
  title = "¿Estás seguro de continuar?",
  message,
  onCancel,
  onConfirm,
  cancelText = "No",
  confirmText = "Sí",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="logout-confirm-overlay"
      onClick={onCancel}
    >
      <div
        className="logout-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacion-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirmacion-modal-title">
          {title}
        </h2>

        {message && <p>{message}</p>}

        <div className="logout-confirm-actions">
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
        </div>
      </div>
    </div>
  );
}
