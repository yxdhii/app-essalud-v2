import React from "react";
import { ChevronRight, Video } from "lucide-react";
import doctoraOnline from "../assets/doctora-online.png";

export default function OnlineAttention({ gender = "female" }) {
  return (
    <button
      className="online-attention"
      type="button"
      aria-label="Acceder a la atención médica virtual"
      onClick={() => {
        console.log("Acceder a atención médica virtual");
      }}
    >
      <span className="online-attention-text">
        <span className="online-eyebrow">
          <Video size={15} />
          ATENCIÓN EN LÍNEA
        </span>

        <strong>Atención médica virtual</strong>

        <span>
          Conéctate por videollamada con un médico.
        </span>

        <span className="online-attention-link">
          Conocer más
          <ChevronRight size={17} />
        </span>
      </span>

      <img
        src={doctoraOnline}
        alt="Doctora con una tableta para atención médica virtual"
        className="online-doctor-image"
      />
    </button>
  );
}