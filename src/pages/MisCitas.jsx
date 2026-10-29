import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CircleHelp,
  CalendarPlus,
  CalendarDays,
  Clock3,
  Video,
  XCircle,
  Star,
  FileText,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";
import emptyAppointments from "../assets/empty-appointments.png";

import {
  obtenerCitasUsuario,
  cancelarCita,
  calificarCita,
} from "../services/citasService.js";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";

export default function MisCitas() {
  const [activeTab, setActiveTab] = useState("Virtual");
  const [citas, setCitas] = useState([]);
  const navigate = useNavigate();

  const usuario = obtenerUsuarioActivo();

  const actualizarCitas = () => {
    if (!usuario) {
      setCitas([]);
      return;
    }

    setCitas(obtenerCitasUsuario(usuario.id));
  };

  useEffect(() => {
    if (!usuario) {
      navigate("/essalud");
      return;
    }

    actualizarCitas();
  }, []);

  const esAnterior = (cita) => {
    const hora = cita.hora || "00:00";
    const fechaCita = new Date(`${cita.fecha}T${hora}:00`);

    return !Number.isNaN(fechaCita.getTime()) && fechaCita < new Date();
  };

  const citasFiltradas = citas.filter((cita) => cita.tipo === activeTab);

  const proximasCitas = citasFiltradas.filter(
    (cita) => !esAnterior(cita) && cita.estado === "Pendiente",
  );

  const citasAnteriores = citasFiltradas.filter(
    (cita) => esAnterior(cita) || cita.estado === "Atendida",
  );

  const citasCanceladas = citasFiltradas.filter(
    (cita) => cita.estado === "Cancelada",
  );

  const manejarCancelacion = (id) => {
    if (window.confirm("¿Estás segura de que deseas cancelar esta cita?")) {
      cancelarCita(id);
      actualizarCitas();
    }
  };

  const manejarCalificacion = (id) => {
    const puntuacion = window.prompt("Califica tu atención del 1 al 5:");

    if (puntuacion === null) return;

    const valor = Number(puntuacion);

    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      window.alert("Ingresa una calificación del 1 al 5.");
      return;
    }

    const comentario = window.prompt("¿Deseas dejar un comentario? (Opcional)");

    calificarCita(id, valor, comentario || "");
    actualizarCitas();
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha pendiente";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) return fecha;

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatearHorario = (horario) => {
    if (!horario) return "Horario pendiente";

    // Si la hora ya tiene a. m. o p. m., no volver a formatearla
    if (/a\.\s*m\.|p\.\s*m\.|AM|PM/i.test(horario)) {
      return horario;
    }

    const [hora, minutos] = horario.split(":");
    const numeroHora = Number(hora);

    if (Number.isNaN(numeroHora) || !minutos) return horario;

    const hora12 = numeroHora % 12 || 12;
    const sufijo = numeroHora >= 12 ? "p. m." : "a. m.";

    return `${hora12}:${minutos} ${sufijo}`;
  };

  const tieneCitas = citas.length > 0;

  const renderizarTarjeta = (cita) => (
    <article className="appointment-card" key={cita.id}>
      <div className="appointment-card-top">
        <span
          className={`appointment-type ${
            cita.tipo === "Virtual" ? "virtual" : "presencial"
          }`}
        >
          {cita.tipo === "Virtual" ? <Video size={16} /> : <MapPin size={16} />}
          {cita.tipo}
        </span>

        <span
          className={`appointment-status ${
            cita.estado === "Cancelada"
              ? "cancelled"
              : cita.estado === "Atendida"
                ? "attended"
                : "pending"
          }`}
        >
          {cita.estado === "Cancelada" ? (
            <XCircle size={15} />
          ) : cita.estado === "Atendida" ? (
            <CheckCircle2 size={15} />
          ) : (
            <Clock3 size={15} />
          )}

          {cita.estado}
        </span>
      </div>

      <div className="appointment-doctor">
        <div className="appointment-avatar">
          {(cita.medico || "M")
            .replace(/^Dra?\.\s*/i, "")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="appointment-doctor-info">
          <h3>{cita.especialidad || "Consulta médica"}</h3>
          <p>{cita.medico || "Médico por confirmar"}</p>
          {cita.cmp && <small>CMP {cita.cmp}</small>}
        </div>
      </div>

      <div className="appointment-details">
        <div>
          <CalendarDays size={19} />
          <span>{formatearFecha(cita.fecha)}</span>
        </div>

        <div>
          <Clock3 size={19} />
          <span>{formatearHorario(cita.horario)}</span>
        </div>
      </div>

      {cita.estado === "Atendida" && cita.calificacion && (
        <div className="appointment-rating">
          {"★".repeat(cita.calificacion)}
          {"☆".repeat(5 - cita.calificacion)}
          <small>
            {cita.comentario ? ` ${cita.comentario}` : " Tu calificación"}
          </small>
        </div>
      )}
      <button
        type="button"
        className="appointment-rate"
        onClick={() =>
          navigate("/essalud/detalle-cita", {
            state: { cita },
          })
        }
      >
        Ver detalles
      </button>

      <div className="appointment-actions">
        {cita.estado === "Pendiente" && !esAnterior(cita) && (
          <button
            type="button"
            className="appointment-cancel"
            onClick={() => manejarCancelacion(cita.id)}
          >
            <XCircle size={17} />
            Cancelar cita
          </button>
        )}

        {cita.estado === "Atendida" && !cita.calificacion && (
          <button
            type="button"
            className="appointment-rate"
            onClick={() => manejarCalificacion(cita.id)}
          >
            <Star size={17} />
            Calificar atención
          </button>
        )}

        {cita.estado === "Pendiente" && esAnterior(cita) && (
          <span className="appointment-note">Fecha de cita transcurrida</span>
        )}

        {cita.estado === "Cancelada" && (
          <span className="appointment-note">Esta cita fue cancelada.</span>
        )}
      </div>
    </article>
  );

  return (
    <main className="appointments-screen">
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/inicio")}
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Mis citas</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          className="reservar-help"
          type="button"
          aria-label="Ayuda"
          onClick={() =>
            window.alert(
              "Aquí puedes consultar la información de tu cita médica.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      <div className="appointments-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "Virtual"}
          className={activeTab === "Virtual" ? "active" : ""}
          onClick={() => setActiveTab("Virtual")}
        >
          Virtuales
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "Presencial"}
          className={activeTab === "Presencial" ? "active" : ""}
          onClick={() => setActiveTab("Presencial")}
        >
          Presenciales
        </button>
      </div>

      <div className="appointments-content">
        {!tieneCitas ? (
          <section className="appointments-empty">
            <img
              src={emptyAppointments}
              alt="Ilustración de una profesional de salud"
              className="appointments-empty-image"
            />

            <h2>¡Aún no tienes citas!</h2>

            <p>
              Aquí aparecerán tus próximas citas médicas cuando las programes.
            </p>

            <button
              type="button"
              className="appointments-book-button"
              onClick={() => navigate("/essalud/reservar-cita")}
            >
              <CalendarPlus size={18} />
              Reservar una cita
            </button>
          </section>
        ) : (
          <>
            <section className="appointments-section">
              <div className="appointments-section-title">
                <h2>Próximas citas</h2>
                <span>{proximasCitas.length}</span>
              </div>

              {proximasCitas.length ? (
                proximasCitas.map(renderizarTarjeta)
              ) : (
                <p className="appointments-message">
                  No tienes próximas citas en esta modalidad.
                </p>
              )}
            </section>

            <section className="appointments-section">
              <div className="appointments-section-title">
                <h2>Citas anteriores</h2>
                <span>{citasAnteriores.length}</span>
              </div>

              {citasAnteriores.length ? (
                citasAnteriores.map(renderizarTarjeta)
              ) : (
                <p className="appointments-message">
                  Aquí aparecerán tus citas anteriores.
                </p>
              )}
            </section>

            {citasCanceladas.length > 0 && (
              <section className="appointments-section">
                <div className="appointments-section-title">
                  <h2>Citas canceladas</h2>
                  <span>{citasCanceladas.length}</span>
                </div>

                {citasCanceladas.map(renderizarTarjeta)}
              </section>
            )}

            <section className="appointments-banner">
              <div className="appointments-banner-icon">
                <FileText size={24} />
              </div>

              <div className="appointments-banner-text">
                <h3>¿Necesitas una nueva cita?</h3>
                <p>
                  Encuentra una especialidad y agenda tu próxima atención
                  médica.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/essalud/reservar-cita")}
              >
                Reservar
                <CalendarPlus size={17} />
              </button>
            </section>
          </>
        )}
      </div>

      <BottomNavigation
        active="citas"
        onNavigate={(id) => {
          if (id === "inicio") navigate("/essalud/inicio");
          if (id === "citas") navigate("/essalud/citas");
          if (id === "recetas") navigate("/essalud/recetas");
          if (id === "perfil") navigate("/essalud/perfil");
        }}
      />
    </main>
  );
}
