import React from "react";
import { Lightbulb, ChevronRight } from "lucide-react";

export default function HealthTip() {
  return (
    <button
      type="button"
      className="health-tip"
      onClick={() => console.log("Consultar consejos de salud")}
    >
      <span className="health-tip-icon">
        <Lightbulb size={28} strokeWidth={1.8} />
      </span>

      <span className="health-tip-text">
        <strong>Consejo de salud</strong>
        <span>
          Mantén una alimentación balanceada y realiza
          actividad física regularmente.
        </span>
      </span>

      <span className="health-tip-action">
        Ver más
        <ChevronRight size={18} />
      </span>
    </button>
  );
}