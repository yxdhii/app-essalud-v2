import React from "react";
import {
  CalendarDays,
  UsersRound,
  FileText,
  FlaskConical,
  ChevronRight,
} from "lucide-react";

const services = [
  {
    title: "Reservar cita",
    description: "Agenda o reprograma tu cita médica",
    icon: CalendarDays,
    color: "blue",
  },
  {
    title: "Mis familiares",
    description: "Gestiona las cuentas de tu familia",
    icon: UsersRound,
    color: "turquoise",
  },
  {
    title: "Recetas",
    description: "Consulta tus recetas médicas",
    icon: FileText,
    color: "purple",
  },
  {
    title: "Exámenes",
    description: "Revisa tus resultados de laboratorio",
    icon: FlaskConical,
    color: "orange",
  },
];

export default function ServicesGrid() {
  const handleServiceClick = (title) => {
    console.log(`Servicio seleccionado: ${title}`);
  };

  return (
    <section
      className="services-section"
      aria-labelledby="services-title"
    >
      <div className="services-heading">
        <div className="services-heading-text">
          <span className="section-eyebrow">
            TUS GESTIONES
          </span>

          <h2 id="services-title">
            Servicios principales
          </h2>

          <p>
            Todo lo que necesitas para cuidar tu salud.
          </p>
        </div>

        <button
          className="services-view-all"
          type="button"
          onClick={() =>
            console.log("Mostrar todos los servicios")
          }
        >
          Ver todos
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="services-grid">
        {services.map(
          ({ title, description, icon: Icon, color }) => (
            <button
              className="service-card"
              key={title}
              type="button"
              aria-label={`${title}. ${description}`}
              onClick={() => handleServiceClick(title)}
            >
              <span
                className={`service-icon service-icon-${color}`}
              >
                <Icon size={25} strokeWidth={1.8} />
              </span>

              <span className="service-title">
                {title}
              </span>

              <span className="service-description">
                {description}
              </span>

              <ChevronRight
                className="service-arrow"
                size={19}
                aria-hidden="true"
              />
            </button>
          )
        )}
      </div>
    </section>
  );
}