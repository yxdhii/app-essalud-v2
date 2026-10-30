import { useLocation, useNavigate } from "react-router-dom";

import BottomNavigation from "../components/BottomNavigation";
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
} from "lucide-react";

export default function DetalleCita() {
  const navigate = useNavigate();
  const location = useLocation();

  const cita = location.state?.cita;
  const activeTabAnterior = location.state?.activeTab || "Virtual";

  // Regresar a Mis citas conservando la pestaña seleccionada.
  const volverAMisCitas = () => {
    navigate("/essalud/citas", {
      state: { activeTab: activeTabAnterior },
    });
  };

  // Navegación inferior.
  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") volverAMisCitas();
    if (id === "chat") navigate("/essalud/chat");
    if (id === "perfil") navigate("/essalud/perfil");
  };

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
        onClick={() =>
          window.alert(
            "Aquí puedes consultar la información de tu cita médica."
          )
        }
      >
        <CircleHelp size={18} />
      </button>
    </header>
  );

  const navegacionInferior = (
    <BottomNavigation active="citas" onNavigate={navegarMenu} />
  );

  // Mostrar mensaje si no se recibió la cita.
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

  const esVirtual = cita.tipo === "Virtual";
  const estaPendiente = cita.estado === "Pendiente";

  // Formatear fecha.
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha pendiente";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) return fecha;

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Formatear hora.
  const formatearHora = (horario) => {
    if (!horario) return "Horario pendiente";

    if (/\b(a\.?\s*m\.?|p\.?\s*m\.?)$/i.test(horario.trim())) {
      return horario.trim();
    }

    const [hora, minutos] = horario.split(":");
    const numeroHora = Number(hora);

    if (Number.isNaN(numeroHora) || !minutos) return horario;

    const periodo = numeroHora >= 12 ? "p. m." : "a. m.";

    return `${numeroHora % 12 || 12}:${minutos} ${periodo}`;
  };

  // Obtener la inicial del médico.
  const inicialMedico = (medico) => {
    const nombre = (medico || "M")
      .replace(/^Dra?\.\s*/i, "")
      .trim();

    return nombre.charAt(0).toUpperCase() || "M";
  };

  // Entrar a la videollamada.
  const entrarVideollamada = () => {
    navigate("/essalud/cita-virtual", {
      state: {
        cita,
        activeTab: activeTabAnterior,
      },
    });
  };

  // Cancelar cita.
  const cancelarCita = () => {
    const confirmar = window.confirm(
      "¿Estás segura de que deseas cancelar esta cita?"
    );

    if (!confirmar) return;

    cancelarCitaServicio(cita.id);

    window.alert("Tu cita se canceló correctamente.");

    volverAMisCitas();
  };

  // Reprogramación simulada.
  const reprogramarCita = () => {
    window.alert(
      "La reprogramación de citas es una función simulada en esta aplicación."
    );
  };

  return (
    <main className="appointments-screen detalle-cita-screen">
      {encabezado}

      <div className="detalle-cita-content">
        {/* TARJETA DEL MÉDICO */}
        <section className="detalle-cita-doctor">
          <div className="detalle-cita-etiquetas">
            <span
              className={
                esVirtual ? "etiqueta-virtual" : "etiqueta-presencial"
              }
            >
              {esVirtual ? <Video size={14} /> : <MapPin size={14} />}

              {esVirtual ? "Virtual" : "Presencial"}
            </span>

            <span
              className={`etiqueta-pendiente ${
                cita.estado === "Cancelada"
                  ? "estado-cancelada"
                  : cita.estado === "Reprogramada"
                    ? "estado-reprogramada"
                    : cita.estado === "Atendida"
                      ? "estado-atendida"
                      : "estado-pendiente"
              }`}
            >
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

              <p>
                {cita.especialidad || "Especialidad no especificada"}
              </p>

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
            <strong>{formatearHora(cita.horario)}</strong>
          </div>

          <div className="detalle-cita-fila">
            <UserRound />
            <span>Paciente</span>
            <strong>{cita.paciente || "Yo"}</strong>
          </div>

          <div className="detalle-cita-fila">
            {esVirtual ? <Video /> : <MapPin />}
            <span>Tipo de atención</span>
            <strong>
              {esVirtual ? "Videoconsulta" : "Presencial"}
            </strong>
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
        {!esVirtual && (
          <div className="detalle-cita-aviso">
            <MapPin size={19} />
            <p>
              Recuerda revisar el establecimiento y la dirección antes de
              acudir a tu cita.
            </p>
          </div>
        )}

        {/* BOTONES */}
        <div className="detalle-cita-acciones">
          {esVirtual && estaPendiente && (
            <button
              type="button"
              className="detalle-cita-boton-principal"
              onClick={entrarVideollamada}
            >
              <Video size={17} />
              Entrar a la videollamada
            </button>
          )}

          {estaPendiente && (
            <>
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
                onClick={cancelarCita}
              >
                <XCircle size={17} />
                Cancelar cita
              </button>
            </>
          )}
        </div>

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

      {navegacionInferior}
    </main>
  );
}