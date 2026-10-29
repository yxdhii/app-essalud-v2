import React from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";

export default function NextAppointment() {
  return (
    <section className="next-appointment-section">
      {/* Título con el mismo diseño de Servicios principales */}
      <div className="services-heading">
        <div className="services-heading-text">
          <h2>Tu próxima cita</h2>
        </div>

        <button
          type="button"
          className="services-view-all"
        >
          Ver todas <ChevronRight size={16} />
        </button>
      </div>

      {/* Tu tarjeta original */}
      <div className="next-appointment">
        <div className="appointment-icon">
          <CalendarCheck size={28} />
        </div>

        <div className="appointment-info">
          <span className="section-eyebrow">TU PRÓXIMA CITA</span>
          <h2>Medicina General</h2>
          <p>H.I. Aurelio Díaz Ufano y Peral</p>
        </div>

        <div className="appointment-date">
          <strong>10 nov.</strong>
          <span>10:30 a. m.</span>
        </div>

        <ChevronRight size={23} />
      </div>
    </section>
  );
}