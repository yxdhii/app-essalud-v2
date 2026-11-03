
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

import BottomNavigation from "../components/BottomNavigation";
import ConfirmacionModal from "../components/ConfirmacionModal";

import logoEssalud from "../assets/digital-logo.png";
import emptyAppointments from "../assets/empty-appointments.png";

import {
  obtenerCitasPaciente,
  cancelarCita,
  calificarCita,
} from "../services/citasService.js";

import {
  obtenerUsuarioActivo,
  obtenerFamiliaresVinculados,
} from "../services/usuariosService.js";

import { usePaciente } from "../context/PacienteContext";

export default function MisCitas() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperar la pestaña seleccionada.
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "Virtual"
  );

  const [citas, setCitas] = useState([]);

  // Estados del modal de confirmación.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Usuario que inició sesión.
  const usuario = obtenerUsuarioActivo();

  // Contexto global del paciente seleccionado.
  const { pacienteSeleccionado } = usePaciente();

  // Familiares vinculados a la cuenta autenticada.
  const familiares = usuario
    ? obtenerFamiliaresVinculados(usuario.dni) || []
    : [];

  // Pacientes que esta cuenta tiene autorizados.
  const pacientesDisponibles = [
    usuario,
    ...familiares,
  ].filter(
    (item, index, lista) =>
      item?.dni &&
      lista.findIndex(
        (persona) =>
          String(persona?.dni) === String(item.dni)
      ) === index
  );

  // Verificar que el paciente del contexto pertenezca
  // al titular que inició sesión.
  const pacienteAutorizado = pacienteSeleccionado?.dni
    ? pacientesDisponibles.find(
        (item) =>
          String(item.dni) ===
          String(pacienteSeleccionado.dni)
      )
    : null;

  // Si el paciente del contexto no pertenece a esta cuenta,
  // mostramos al titular autenticado.
  const pacienteActual = pacienteAutorizado || usuario;

  // Obtener exclusivamente las citas del paciente activo.
  const actualizarCitas = () => {
    if (!usuario || !pacienteActual?.dni) {
      setCitas([]);
      return;
    }

    setCitas(
      obtenerCitasPaciente(pacienteActual.dni)
    );
  };

  // Validar sesión y actualizar cuando cambie el paciente.
  useEffect(() => {
    if (!usuario) {
      navigate("/essalud");
      return;
    }

    actualizarCitas();
  }, [usuario?.id, pacienteActual?.dni]);

  // Comprobar si la cita ya pasó.
  const esAnterior = (cita) => {
    const hora = cita.hora || cita.horario || "00:00";

    const fechaCita = new Date(
      `${cita.fecha}T${hora}:00`
    );

    return (
      !Number.isNaN(fechaCita.getTime()) &&
      fechaCita < new Date()
    );
  };

  // Filtrar las citas según la pestaña seleccionada.
  const citasFiltradas = citas.filter(
    (cita) => cita.tipo === activeTab
  );

  // Próximas citas.
  const proximasCitas = citasFiltradas.filter(
    (cita) =>
      !esAnterior(cita) &&
      (cita.estado === "Pendiente" ||
        cita.estado === "Programada")
  );

  // Citas anteriores.
  const citasAnteriores = citasFiltradas.filter(
    (cita) =>
      esAnterior(cita) || cita.estado === "Atendida"
  );

  // Citas canceladas.
  const citasCanceladas = citasFiltradas.filter(
    (cita) => cita.estado === "Cancelada"
  );

  const tieneCitas = citas.length > 0;

  // Nombre del paciente asociado a cada cita.
  const obtenerNombrePaciente = (cita) => {
    if (cita.pacienteNombre) {
      return cita.pacienteNombre;
    }

    if (
      cita.pacienteId &&
      String(cita.pacienteId) === String(pacienteActual?.dni)
    ) {
      return (
        pacienteActual?.nombres ||
        pacienteActual?.nombre ||
        "Paciente"
      );
    }

    return "Paciente";
  };

  // Abrir modal para confirmar la cancelación.
  const manejarCancelacion = (id) => {
    setCitaSeleccionada(id);
    setModalAbierto(true);
  };

  // Confirmar la cancelación.
  const confirmarCancelacion = () => {
    if (citaSeleccionada === null) return;

    try {
      cancelarCita(citaSeleccionada);

      setModalAbierto(false);
      setCitaSeleccionada(null);

      actualizarCitas();
    } catch (error) {
      console.error("Error al cancelar la cita:", error);

      window.alert(
        "No se pudo cancelar la cita. Inténtalo nuevamente."
      );
    }
  };

  // Cerrar modal sin cancelar.
  const cerrarModalCancelacion = () => {
    setModalAbierto(false);
    setCitaSeleccionada(null);
  };

  // Calificar la atención.
  const manejarCalificacion = (id) => {
    const puntuacion = window.prompt(
      "Califica tu atención del 1 al 5:"
    );

    if (puntuacion === null) return;

    const valor = Number(puntuacion);

    if (
      !Number.isInteger(valor) ||
      valor < 1 ||
      valor > 5
    ) {
      window.alert("Ingresa una calificación del 1 al 5.");
      return;
    }

    const comentario = window.prompt(
      "¿Deseas dejar un comentario? (Opcional)"
    );

    calificarCita(id, valor, comentario || "");

    actualizarCitas();
  };

  // Formatear fecha.
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha pendiente";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) {
      return fecha;
    }

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Formatear horario.
  const formatearHorario = (horario) => {
    if (!horario) return "Horario pendiente";

    if (/\b(a\.?\s*m\.?|p\.?\s*m\.?)$/i.test(horario.trim())) {
      return horario.trim();
    }

    if (/\b(AM|PM)\b/i.test(horario)) {
      return horario;
    }

    const [hora, minutos] = horario.split(":");
    const numeroHora = Number(hora);

    if (Number.isNaN(numeroHora) || !minutos) {
      return horario;
    }

    const hora12 = numeroHora % 12 || 12;
    const sufijo =
      numeroHora >= 12 ? "p. m." : "a. m.";

    return `${hora12}:${minutos} ${sufijo}`;
  };

  // Abrir detalle conservando la pestaña actual.
  const verDetalle = (cita) => {
    navigate("/essalud/detalle-cita", {
      state: {
        cita,
        activeTab,
        paciente: pacienteActual,
      },
    });
  };

  // Ir a reservar una cita para el paciente activo.
  const irAReservar = () => {
    navigate("/essalud/reservar-cita");
  };

  // Renderizar tarjeta de cita.
  const renderizarTarjeta = (cita) => (
    <article className="appointment-card" key={cita.id}>
      <div className="appointment-card-top">
        <span
          className={`appointment-type ${
            cita.tipo === "Virtual" ? "virtual" : "presencial"
          }`}
        >
          {cita.tipo === "Virtual" ? (
            <Video size={16} />
          ) : (
            <MapPin size={16} />
          )}

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

      {/* Paciente de la cita */}
      <p className="appointment-patient">
        Paciente:{" "}
        <strong>{obtenerNombrePaciente(cita)}</strong>
      </p>

      <div className="appointment-doctor">
        <div className="appointment-avatar">
          {(cita.medico || "M")
            .replace(/^Dra?\.\s*/i, "")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="appointment-doctor-info">
          <h3>
            {cita.especialidad || "Consulta médica"}
          </h3>

          <p>{cita.medico || "Médico por confirmar"}</p>

          {cita.cmp && (
            <small>CMP {cita.cmp}</small>
          )}
        </div>
      </div>

      <div className="appointment-details">
        <div>
          <CalendarDays size={19} />
          <span>{formatearFecha(cita.fecha)}</span>
        </div>

        <div>
          <Clock3 size={19} />
          <span>
            {formatearHorario(cita.horario || cita.hora)}
          </span>
        </div>
      </div>

      {cita.estado === "Atendida" && cita.calificacion && (
        <div className="appointment-rating">
          {"★".repeat(cita.calificacion)}
          {"☆".repeat(5 - cita.calificacion)}

          <small>
            {cita.comentario
              ? ` ${cita.comentario}`
              : " Tu calificación"}
          </small>
        </div>
      )}

      <button
        type="button"
        className="appointment-rate"
        onClick={() => verDetalle(cita)}
      >
        Ver detalles
      </button>

      <div className="appointment-actions">
        {cita.estado === "Pendiente" &&
          !esAnterior(cita) && (
            <button
              type="button"
              className="appointment-cancel"
              onClick={() => manejarCancelacion(cita.id)}
            >
              <XCircle size={17} />
              Cancelar cita
            </button>
          )}

        {cita.estado === "Atendida" &&
          !cita.calificacion && (
            <button
              type="button"
              className="appointment-rate"
              onClick={() => manejarCalificacion(cita.id)}
            >
              <Star size={17} />
              Calificar atención
            </button>
          )}

        {cita.estado === "Pendiente" &&
          esAnterior(cita) && (
            <span className="appointment-note">
              Fecha de cita transcurrida
            </span>
          )}

        {cita.estado === "Cancelada" && (
          <span className="appointment-note">
            Esta cita fue cancelada.
          </span>
        )}
      </div>
    </article>
  );

  // Navegación inferior.
  const navegarMenu = (id) => {
    if (id === "inicio") {
      navigate("/essalud/inicio");
    }

    if (id === "citas") {
      navigate("/essalud/citas", {
        state: { activeTab },
      });
    }

    if (id === "chat") {
      navigate("/essalud/chat");
    }

    if (id === "perfil") {
      navigate("/essalud/perfil");
    }
  };

  return (
    <main className="appointments-screen mis-citas-screen">

      {/* ENCABEZADO */}
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
              "Aquí puedes consultar la información de tu cita médica."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* PESTAÑAS */}
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
          className={
            activeTab === "Presencial" ? "active" : ""
          }
          onClick={() => setActiveTab("Presencial")}
        >
          Presenciales
        </button>
      </div>

      {/* PACIENTE ACTUAL: DEBAJO DE LAS PESTAÑAS */}
      <div className="appointments-patient-context">
        <span>Mostrando citas de:</span>

        <strong>
          {pacienteActual?.nombres ||
            pacienteActual?.nombre ||
            "Usuario"}
        </strong>
      </div>

      {/* CONTENIDO */}
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
              Aquí aparecerán tus próximas citas médicas cuando las
              programes.
            </p>

            <button
              type="button"
              className="appointments-book-button"
              onClick={irAReservar}
            >
              <CalendarPlus size={18} />
              Reservar una cita
            </button>
          </section>
        ) : (
          <>
            {/* PRÓXIMAS CITAS */}
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

            {/* CITAS ANTERIORES */}
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

            {/* CITAS CANCELADAS */}
            {citasCanceladas.length > 0 && (
              <section className="appointments-section">
                <div className="appointments-section-title">
                  <h2>Citas canceladas</h2>
                  <span>{citasCanceladas.length}</span>
                </div>

                {citasCanceladas.map(renderizarTarjeta)}
              </section>
            )}

            {/* BANNER DE RESERVA */}
            <section className="appointments-banner">
              <div className="appointments-banner-icon">
                <FileText size={24} />
              </div>

              <div className="appointments-banner-text">
                <h3>¿Necesitas una nueva cita?</h3>

                <p>
                  Encuentra una especialidad y agenda tu próxima
                  atención médica.
                </p>
              </div>

              <button
                type="button"
                onClick={irAReservar}
              >
                Reservar
                <CalendarPlus size={17} />
              </button>
            </section>
          </>
        )}
      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation
        active="citas"
        onNavigate={navegarMenu}
      />

      {/* MODAL DE CONFIRMACIÓN PARA CANCELAR CITA */}
      <ConfirmacionModal
        isOpen={modalAbierto}
        title="¿Cancelar cita médica?"
        message="¿Estás segura de que deseas cancelar esta cita? Esta acción no se puede deshacer."
        cancelText="No, regresar"
        confirmText="Sí, cancelar"
        onCancel={cerrarModalCancelacion}
        onConfirm={confirmarCancelacion}
      />
    </main>
  );
}
