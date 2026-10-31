
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersRound,
  FileText,
  FlaskConical,
  Hospital,
  ChevronRight,
} from "lucide-react";

const services = [
  {
    title: "Mis familiares",
    description: "Gestiona las cuentas de tu familia",
    icon: UsersRound,
    color: "blue",
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
    color: "blue",
  },
  {
    title: "Centros de atención",
    description: "Busca hospitales, policlínicos y más",
    icon: Hospital,
    color: "pink",
  },
];

export default function ServicesGrid() {
  const navigate = useNavigate();

  const handleServiceClick = (title) => {
    switch (title) {
      case "Mis familiares":
        navigate("/essalud/seleccionar-perfil");
        break;

      case "Recetas":
        navigate("/essalud/recetas");
        break;

      case "Exámenes":
        navigate("/essalud/examenes");
        break;

      case "Centros de atención":
        navigate("/essalud/centros-atencion");
        break;

      default:
        break;
    }
  };

  return (
    <section
      className="services-section"
      aria-labelledby="services-title"
    >
      <div className="services-heading">
        <h2 id="services-title">Servicios principales</h2>

        <button
          type="button"
          className="services-view-all"
          onClick={() => navigate("/essalud/servicios")}
        >
          Ver todos
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="services-grid">
        {services.map(
          ({ title, description, icon: Icon, color }) => (
            <button
              className="service-card"
              key={title}
              type="button"
              onClick={() => handleServiceClick(title)}
              aria-label={`${title}. ${description}`}
            >
              <span className={`service-icon service-icon-${color}`}>
                <Icon size={27} strokeWidth={1.8} />
              </span>

              <span className="service-card-content">
                <span className="service-title">{title}</span>

                <span className="service-description">
                  {description}
                </span>
              </span>

              <ChevronRight
                className="service-arrow"
                size={21}
              />
            </button>
          )
        )}
      </div>
    </section>
  );
}