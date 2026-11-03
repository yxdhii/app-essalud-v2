import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomNavigation from "../components/BottomNavigation";
import ConfirmacionModal from "../components/ConfirmacionModal";

import logoEssalud from "../assets/digital-logo.png";

import { cancelarCita as cancelarCitaServicio } from "../services/citasService.js";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  Video,
  MapPin,
  XCircle,
  CircleHelp,
  CalendarCheck,
  Info,
  UserCheck,
} from "lucide-react";

export default function DetalleCita() {
  const navigate = useNavigate();
  const location = useLocation();

  const cita = location.state?.cita;
  const activeTabAnterior = location.state?.activeTab || "Virtual";
  const pacienteContexto = location.state?.paciente || null;
  // Estados de los modales
  const [modalAbierto, setModalAbierto] = useState(null);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  // VOLVER A MIS CITAS CONSERVANDO EL PACIENTE
  const volverAMisCitas = () => {
    navigate("/essalud/citas", {
      state: {
        activeTab: activeTabAnterior,
        paciente: pacienteContexto,
      },
    });
  };

  // NAVEGACIÓN INFERIOR
  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") volverAMisCitas();
    if (id === "chat") navigate("/essalud/chat");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  // ENCABEZADO
  const encabezado = (
    <header className="appointments-header">
      <button
        type="button"
        className="appointments-back"
        onClick={volverAMisCitas}
        aria-label="Volver a Mis citas"
      >
        <ArrowLeft size={23} />
      </button>

      <h1>Detalle de cita</h1>

      <img
        src={logoEssalud}
        alt="EsSalud Digital"
        className="appointments-logo"
      />

      <button
        className="reservar-help"
        type="button"
        aria-label="Ayuda"
        onClick={() => setMostrarAyuda(true)}
      >
        <CircleHelp size={18} />
      </button>
    </header>
  );

  // NAVEGACIÓN INFERIOR
  const navegacionInferior = (
    <BottomNavigation active="citas" onNavigate={navegarMenu} />
  );

  // COMPROBAR SI EXISTE LA CITA
  if (!cita) {
    return (
      <main className="appointments-screen detalle-cita-screen">
        {encabezado}

        <section className="detalle-cita-vacio">
          <h2>No se encontró la cita</h2>

          <p>Selecciona una cita desde la sección Mis citas.</p>

          <button type="button" onClick={volverAMisCitas}>
            Volver a Mis citas
          </button>
        </section>

        {navegacionInferior}
      </main>
    );
  }

  // DATOS DE LA CITA
  const esVirtual = cita.tipo === "Virtual";
  const estaPendiente = cita.estado === "Pendiente";

  // IDENTIFICACIÓN DEL PACIENTE
  const nombrePaciente =
    cita.pacienteNombre ||
    (cita.paciente === "Yo"
      ? "Titular de la cuenta"
      : cita.paciente === "Familiar"
        ? "Familiar vinculado"
        : cita.paciente || "No especificado");

  // PERSONA QUE GESTIONÓ LA RESERVA
  const nombreSolicitante = cita.solicitanteNombre || "No especificado";

  // FORMATEAR FECHA
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha pendiente";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) {
      return fecha;
    }

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // FORMATEAR HORA
  const formatearHora = (horario) => {
    if (!horario) return "Horario pendiente";

    if (/\b(a\.?\s*m\.?|p\.?\s*m\.?)$/i.test(horario.trim())) {
      return horario.trim();
    }

    const [hora, minutos] = horario.split(":");
    const numeroHora = Number(hora);

    if (Number.isNaN(numeroHora) || !minutos) {
      return horario;
    }

    const periodo = numeroHora >= 12 ? "p. m." : "a. m.";

    return `${numeroHora % 12 || 12}:${minutos} ${periodo}`;
  };

  // INICIAL DEL MÉDICO
  const inicialMedico = (medico) => {
    const nombre = (medico || "M").replace(/^Dra?\.\s*/i, "").trim();

    return nombre.charAt(0).toUpperCase() || "M";
  };

  // ABRIR VIDEOLLAMADA CONSERVANDO LOS DATOS
  const entrarVideollamada = () => {
    navigate("/essalud/cita-virtual", {
      state: {
        cita,
        activeTab: activeTabAnterior,
        paciente: pacienteContexto,
      },
    });
  };

  // MOSTRAR CONFIRMACIÓN DE VIDEOLLAMADA
  const confirmarVideollamada = () => {
    setModalAbierto("videollamada");
  };

  // MOSTRAR CONFIRMACIÓN DE CANCELACIÓN
  const confirmarCancelacion = () => {
    setModalAbierto("cancelar");
  };

  // EJECUTAR ACCIÓN CONFIRMADA
  const ejecutarAccion = () => {
    if (modalAbierto === "videollamada") {
      setModalAbierto(null);
      entrarVideollamada();
      return;
    }

    if (modalAbierto === "cancelar") {
      try {
        cancelarCitaServicio(cita.id);

        setModalAbierto(null);

        window.alert("Tu cita se canceló correctamente.");

        volverAMisCitas();
      } catch (error) {
        console.error("Error al cancelar la cita:", error);

        setModalAbierto(null);

        window.alert("No se pudo cancelar la cita. Inténtalo nuevamente.");
      }
    }
  };

  // REPROGRAMACIÓN
  const reprogramarCita = () => {
    window.alert(
      "La reprogramación de citas es una función simulada en esta aplicación.",
    );
  };

  // ESTADO VISUAL DE LA CITA
  const claseEstado =
    cita.estado === "Cancelada"
      ? "estado-cancelada"
      : cita.estado === "Reprogramada"
        ? "estado-reprogramada"
        : cita.estado === "Atendida"
          ? "estado-atendida"
          : "estado-pendiente";

  return (
    <main className="appointments-screen detalle-cita-screen">
      {encabezado}

      <div className="detalle-cita-content">
        {/* TARJETA DEL MÉDICO */}
        <section className="detalle-cita-doctor">
          <div className="detalle-cita-etiquetas">
            <span
              className={esVirtual ? "etiqueta-virtual" : "etiqueta-presencial"}
            >
              {esVirtual ? <Video size={14} /> : <MapPin size={14} />}

              {esVirtual ? "Virtual" : "Presencial"}
            </span>

            <span className={`etiqueta-pendiente ${claseEstado}`}>
              {cita.estado === "Cancelada" ? (
                <XCircle size={13} />
              ) : cita.estado === "Reprogramada" ? (
                <CalendarCheck size={13} />
              ) : (
                <Clock3 size={13} />
              )}

              {cita.estado || "Pendiente"}
            </span>
          </div>

          <div className="detalle-cita-medico">
            <div className="detalle-cita-avatar">
              {inicialMedico(cita.medico)}
            </div>

            <div className="detalle-cita-medico-info">
              <h2>{cita.medico || "Médico por confirmar"}</h2>

              <p>{cita.especialidad || "Especialidad no especificada"}</p>

              {cita.cmp && <small>CMP {cita.cmp}</small>}
            </div>
          </div>
        </section>

        {/* INFORMACIÓN DE LA CITA */}
        <section className="detalle-cita-informacion">
          <h2>Información de la cita</h2>

          <div className="detalle-cita-fila">
            <CalendarDays />
            <span>Fecha</span>
            <strong>{formatearFecha(cita.fecha)}</strong>
          </div>

          <div className="detalle-cita-fila">
            <Clock3 />
            <span>Hora</span>
            <strong>{formatearHora(cita.horario || cita.hora)}</strong>
          </div>

          {/* PACIENTE */}
          <div className="detalle-cita-fila">
            <UserRound />
            <span>Paciente</span>
            <strong>{nombrePaciente}</strong>
          </div>

          {/* PERSONA QUE GESTIONÓ LA RESERVA */}
          <div className="detalle-cita-fila">
            <UserCheck />
            <span>Gestionada por</span>
            <strong>{nombreSolicitante}</strong>
          </div>

          <div className="detalle-cita-fila">
            {esVirtual ? <Video /> : <MapPin />}

            <span>Tipo de atención</span>

            <strong>{esVirtual ? "Videoconsulta" : "Presencial"}</strong>
          </div>

          {!esVirtual && (
            <div className="detalle-cita-fila">
              <MapPin />
              <span>Centro de atención</span>

              <strong>
                {cita.centroNombre ||
                  cita.establecimiento ||
                  "Centro de atención asignado"}
              </strong>
            </div>
          )}

          <div className="detalle-cita-fila">
            <CalendarCheck />
            <span>Especialidad</span>

            <strong>{cita.especialidad || "Por confirmar"}</strong>
          </div>
        </section>

        {/* AVISO PARA CITAS VIRTUALES */}
        {esVirtual && estaPendiente && (
          <div className="detalle-cita-aviso">
            <Video size={19} />

            <p>
              Podrás ingresar a la videollamada 10 minutos antes de tu cita.
            </p>
          </div>
        )}

        {/* AVISO PARA CITAS PRESENCIALES */}
        {!esVirtual && estaPendiente && (
          <div className="detalle-cita-aviso">
            <MapPin size={19} />

            <p>
              Recuerda revisar el establecimiento y la dirección antes de acudir
              a tu cita.
            </p>
          </div>
        )}

        {/* ACCIONES DE LA CITA */}
        {estaPendiente && (
          <div className="detalle-cita-acciones">
            {esVirtual && (
              <button
                type="button"
                className="detalle-cita-boton-principal"
                onClick={confirmarVideollamada}
              >
                <Video size={17} />
                Entrar a la videollamada
              </button>
            )}

            <button
              type="button"
              className="detalle-cita-boton-reprogramar"
              onClick={reprogramarCita}
            >
              <CalendarCheck size={17} />
              Reprogramar cita
            </button>

            <button
              type="button"
              className="detalle-cita-boton-cancelar"
              onClick={confirmarCancelacion}
            >
              <XCircle size={17} />
              Cancelar cita
            </button>
          </div>
        )}

        {/* RECOMENDACIONES */}
        {esVirtual && (
          <section className="detalle-cita-recomendaciones">
            <div className="detalle-cita-recomendaciones-titulo">
              <Info size={15} />
              <h3>Recomendaciones</h3>
            </div>

            <ul>
              <li>Conéctate desde un lugar con buena señal.</li>

              <li>Usa audífonos para una mejor comunicación.</li>

              <li>
                Ten a la mano tu DNI y tus resultados médicos (si los tienes).
              </li>
            </ul>
          </section>
        )}
      </div>

      {/* MODAL REUTILIZABLE PARA TODAS LAS ACCIONES */}
      <ConfirmacionModal
        isOpen={modalAbierto !== null}
        title={
          modalAbierto === "videollamada"
            ? "¿Deseas ingresar a la videollamada?"
            : "¿Deseas cancelar tu cita?"
        }
        message={
          modalAbierto === "videollamada"
            ? "Estás por ingresar a tu consulta médica virtual. Verifica que estés listo para comunicarte con tu médico."
            : "Esta acción cancelará tu cita médica programada. ¿Estás seguro de continuar?"
        }
        cancelText={
          modalAbierto === "videollamada" ? "No, todavía no" : "No, regresar"
        }
        confirmText={
          modalAbierto === "videollamada" ? "Sí, ingresar" : "Sí, cancelar"
        }
        onCancel={() => setModalAbierto(null)}
        onConfirm={ejecutarAccion}
      />

      {/* MODAL DE AYUDA */}
      <ConfirmacionModal
        isOpen={mostrarAyuda}
        variant="help"
        title="Ayuda - Detalle de cita"
        message="Consulta los datos de tu cita, revisa sus detalles y gestiona las opciones de reprogramación o cancelación. Si es virtual, podrás acceder a tu videollamada."
        confirmText="Entendido"
        onCancel={() => setMostrarAyuda(false)}
      />

      {/* NAVEGACIÓN INFERIOR */}
      {navegacionInferior}
    </main>
  );
}
