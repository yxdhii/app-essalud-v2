import React from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { obtenerUsuarioActivo } from "../services/usuariosService.js";
import { obtenerProximaCita } from "../services/citasService.js";

export default function NextAppointment() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const usuarioId = usuario?.id;
  const cita = obtenerProximaCita(usuarioId);

  const formatearFecha = (fecha) => {
    const [year, month, day] = fecha.split("-").map(Number);

    return new Date(year, month - 1, day)
      .toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
      })
      .replace(".", "");
  };

  const formatearHora = (hora) => {
    const [horas, minutos] = hora.split(":").map(Number);
    const periodo = horas >= 12 ? "p. m." : "a. m.";
    const hora12 = horas % 12 || 12;

    return `${hora12}:${String(minutos).padStart(2, "0")} ${periodo}`;
  };

  return (
    <section className="next-appointment-section">
      <div className="services-heading">
        <div className="services-heading-text">
          <h2>Tu próxima cita</h2>
        </div>

        <button
  type="button"
  className="services-view-all"
  onClick={() =>
    navigate("/essalud/citas", {
      state: {
        activeTab: "Virtual",
      },
    })
  }
>
  Ver todas <ChevronRight size={16} />
</button>
      </div>

      {cita ? (
        <div
          className="next-appointment"
          role="button"
          tabIndex={0}
          onClick={() =>
            navigate("/essalud/detalle-cita", {
              state: {
                cita,
                activeTab:
                  cita.tipo === "Presencial" ? "Presencial" : "Virtual",
              },
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/essalud/detalle-cita", {
                state: {
                  cita,
                  activeTab:
                    cita.tipo === "Presencial" ? "Presencial" : "Virtual",
                },
              });
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="appointment-icon">
            <CalendarCheck size={28} />
          </div>

          <div className="appointment-info">
            <span className="section-eyebrow">TU PRÓXIMA CITA</span>
            <h2>{cita.especialidad}</h2>
            <p>{cita.centroNombre}</p>
          </div>

          <div className="appointment-date">
            <strong>{formatearFecha(cita.fecha)}</strong>
            <span>{formatearHora(cita.hora)}</span>
          </div>

          <ChevronRight size={23} />
        </div>
      ) : (
        <div className="next-appointment">
          <div className="appointment-icon">
            <CalendarCheck size={28} />
          </div>

          <div className="appointment-info">
            <span className="section-eyebrow">TU PRÓXIMA CITA</span>
            <h2>Sin citas programadas</h2>
            <p>Cuando reserves una cita, aparecerá aquí.</p>
          </div>
        </div>
      )}
    </section>
  );
}
