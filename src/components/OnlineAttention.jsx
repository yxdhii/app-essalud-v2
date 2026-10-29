import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Cambia el nombre del archivo si guardaste la ilustración con otro nombre.
import reservarCitaImage from "../assets/reservar-cita.png";

export default function OnlineAttention() {
  const navigate = useNavigate();

  const handleReservar = () => {
    navigate("/essalud/reservar-cita");
  };

  return (
    <button
      type="button"
      className="online-attention"
      onClick={handleReservar}
      aria-label="Reservar cita médica"
    >
      <span className="online-attention-text">
        <span className="online-eyebrow">
          TU SALUD MÁS CERCA DE TI
        </span>

        <strong>Reservar cita</strong>

        <span>
          Encuentra una especialidad y agenda tu próxima cita médica.
        </span>
      </span>

      <img
        src={reservarCitaImage}
        alt=""
        aria-hidden="true"
        className="online-doctor-image"
      />

      <span className="online-attention-arrow">
        <ChevronRight size={24} strokeWidth={2.5} />
      </span>
    </button>
  );
}