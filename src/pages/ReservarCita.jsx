
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { guardarCita } from "../services/citasService.js";
import {
  obtenerUsuarioActivo,
  obtenerFamiliaresVinculados,
} from "../services/usuariosService.js";

import { usePaciente } from "../context/PacienteContext";

import BottomNavigation from "../components/BottomNavigation";
import ConfirmacionModal from "../components/ConfirmacionModal";
import logoEssalud from "../assets/digital-logo.png";

import {
  ArrowLeft,
  CircleHelp,
  Building2,
  Video,
  Search,
  Stethoscope,
  HeartPulse,
  Baby,
  Brain,
  UserRound,
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserRoundCheck,
  MapPin,
  ClipboardCheck,
} from "lucide-react";

// ESPECIALIDADES
const especialidades = [
  {
    nombre: "Medicina General",
    descripcion: "Atención integral",
    icono: Stethoscope,
  },
  {
    nombre: "Pediatría",
    descripcion: "Niños y adolescentes",
    icono: Baby,
  },
  {
    nombre: "Ginecología y Obstetricia",
    descripcion: "Salud de la mujer",
    icono: HeartPulse,
  },
  {
    nombre: "Psicología",
    descripcion: "Bienestar emocional",
    icono: Brain,
  },
  {
    nombre: "Medicina Interna",
    descripcion: "Salud del adulto",
    icono: UserRound,
  },
  {
    nombre: "Cardiología",
    descripcion: "Salud del corazón",
    icono: HeartPulse,
  },
  {
    nombre: "Cirugía General",
    descripcion: "Evaluación y tratamiento",
    icono: UserRoundCheck,
  },
  {
    nombre: "Dermatología",
    descripcion: "Cuidado de la piel",
    icono: Sparkles,
  },
];

// MÉDICOS
const medicos = [
  {
    id: 1,
    nombre: "Dr. Carlos Mendoza",
    especialidad: "Medicina General",
    cmp: "65432",
    disponibilidad: "Lun. 26 oct. · 9:00 a. m.",
    iniciales: "CM",
    color: "azul",
  },
  {
    id: 2,
    nombre: "Dra. Ana Torres",
    especialidad: "Medicina General",
    cmp: "98765",
    disponibilidad: "Mar. 27 oct. · 10:00 a. m.",
    iniciales: "AT",
    color: "rosa",
  },
  {
    id: 3,
    nombre: "Dr. Luis Ramírez",
    especialidad: "Medicina General",
    cmp: "56789",
    disponibilidad: "Mié. 28 oct. · 8:00 a. m.",
    iniciales: "LR",
    color: "verde",
  },
  {
    id: 4,
    nombre: "Dra. María Rojas",
    especialidad: "Pediatría",
    cmp: "72314",
    disponibilidad: "Mar. 27 oct. · 11:00 a. m.",
    iniciales: "MR",
    color: "rosa",
  },
  {
    id: 5,
    nombre: "Dr. José Castillo",
    especialidad: "Cardiología",
    cmp: "61248",
    disponibilidad: "Jue. 29 oct. · 3:00 p. m.",
    iniciales: "JC",
    color: "azul",
  },
  {
    id: 6,
    nombre: "Dra. Elena Vargas",
    especialidad: "Ginecología y Obstetricia",
    cmp: "84321",
    disponibilidad: "Vie. 30 oct. · 9:00 a. m.",
    iniciales: "EV",
    color: "verde",
  },
];

// HORARIOS
const horarios = [
  "8:00 a. m.",
  "9:00 a. m.",
  "10:00 a. m.",
  "11:00 a. m.",
  "12:00 p. m.",
  "3:00 p. m.",
  "4:00 p. m.",
  "5:00 p. m.",
];

// PASOS
const pasos = [
  { numero: 1, texto: "Tipo de cita" },
  { numero: 2, texto: "Especialidad" },
  { numero: 3, texto: "Médico" },
  { numero: 4, texto: "Fecha y horario" },
];

// FORMATEAR FECHA
function fechaBonita(valor) {
  if (!valor) return "No seleccionada";

  return new Date(`${valor}T12:00:00`).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReservarCita() {
  const navigate = useNavigate();
  const location = useLocation();

  // USUARIO TITULAR QUE TIENE LA SESIÓN ACTIVA
  const usuario = obtenerUsuarioActivo();

  // CONTEXTO GLOBAL DEL PACIENTE
  const {
    pacienteSeleccionado: pacienteContexto,
    seleccionarPaciente: cambiarPacienteActivo,
  } = usePaciente();

  // FAMILIARES VINCULADOS AL TITULAR
  const familiares = usuario
    ? obtenerFamiliaresVinculados(usuario.dni) || []
    : [];

  // LISTA DE PACIENTES: TITULAR + FAMILIARES
  const pacientesDisponibles = [
    usuario,
    ...familiares,
  ].filter(
    (item, index, lista) =>
      item &&
      item.dni &&
      lista.findIndex(
        (persona) => String(persona?.dni) === String(item.dni)
      ) === index
  );

  // OBTENER PACIENTE RECIBIDO O PACIENTE DEL CONTEXTO
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(() => {
    const pacienteRecibido =
      location.state?.paciente || pacienteContexto;

    if (pacienteRecibido?.dni) {
      return (
        pacientesDisponibles.find(
          (item) =>
            String(item.dni) === String(pacienteRecibido.dni)
        ) || usuario
      );
    }

    return usuario;
  });

  // MANTENER SINCRONIZADO EL PACIENTE CON EL CONTEXTO GLOBAL
  useEffect(() => {
    const pacienteRecibido =
      location.state?.paciente || pacienteContexto;

    if (!pacienteRecibido?.dni) return;

    const pacienteEncontrado = pacientesDisponibles.find(
      (item) =>
        String(item.dni) === String(pacienteRecibido.dni)
    );

    if (pacienteEncontrado) {
      setPacienteSeleccionado(pacienteEncontrado);
    }
  }, [pacienteContexto?.dni, location.state?.paciente?.dni]);

  // IDENTIFICAR SI EL PACIENTE ES UN FAMILIAR
  const esFamiliar =
    pacienteSeleccionado &&
    usuario &&
    String(pacienteSeleccionado.dni) !== String(usuario.dni);

  // ESTADOS DE LA RESERVA
  const [paso, setPaso] = useState(1);
  const [tipoCita, setTipoCita] = useState("Presencial");
  const [busqueda, setBusqueda] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [medico, setMedico] = useState(null);
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");

  // MODAL
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // FILTRAR ESPECIALIDADES
  const resultados = useMemo(
    () =>
      especialidades.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [busqueda]
  );

  // MÉDICOS DISPONIBLES
  const medicosDisponibles = useMemo(() => {
    if (!especialidad) return [];

    return medicos.filter(
      (item) => item.especialidad === especialidad
    );
  }, [especialidad]);

  // SELECCIONAR PACIENTE PARA LA RESERVA
  const seleccionarPacienteReserva = (paciente) => {
    setPacienteSeleccionado(paciente);

    // Actualizar el contexto global sin cambiar la sesión del titular.
    if (usuario?.dni && paciente?.dni) {
      cambiarPacienteActivo(paciente, usuario);
    }
  };

  // CONTINUAR ENTRE PASOS
  const continuar = () => {
    if (paso === 1) {
      if (!pacienteSeleccionado) {
        window.alert(
          "Selecciona a la persona que recibirá la atención."
        );
        return;
      }

      setPaso(2);
    } else if (paso === 2 && especialidad) {
      setPaso(3);
    } else if (paso === 3 && medico) {
      setPaso(4);
    }
  };

  // VOLVER
  const volver = () => {
    if (mostrarConfirmacion) {
      setMostrarConfirmacion(false);
      return;
    }

    if (paso > 1 && paso <= 4) {
      setPaso(paso - 1);
    } else if (paso === 5) {
      setPaso(4);
    } else {
      navigate("/essalud/inicio");
    }
  };

  // SELECCIONAR ESPECIALIDAD
  const seleccionarEspecialidad = (nombre) => {
    setEspecialidad(nombre);
    setMedico(null);
    setFecha("");
    setHorario("");
  };

  // SELECCIONAR MÉDICO
  const seleccionarMedico = (item) => {
    setMedico(item);
    setFecha("");
    setHorario("");
  };

  // REINICIAR RESERVA
  const reiniciarReserva = () => {
    setPaso(1);
    setTipoCita("Presencial");
    setBusqueda("");
    setEspecialidad("");
    setMedico(null);
    setFecha("");
    setHorario("");
    setMostrarConfirmacion(false);

    // Conservamos al paciente seleccionado.
  };

  // MOSTRAR MODAL ANTES DE RESERVAR
  const confirmarReserva = () => {
    if (!usuario) {
      window.alert(
        "Tu sesión no está activa. Inicia sesión nuevamente."
      );
      navigate("/essalud");
      return;
    }

    if (
      !pacienteSeleccionado ||
      !medico ||
      !especialidad ||
      !fecha ||
      !horario
    ) {
      window.alert(
        "Completa los datos de tu cita antes de continuar."
      );
      return;
    }

    setMostrarConfirmacion(true);
  };

  // CONVERTIR HORARIO A FORMATO DE 24 HORAS
  const convertirHora = (valor) => {
    const [horaTexto, periodo, meridiano] = valor.split(" ");
    const [horas, minutos] = horaTexto.split(":").map(Number);

    const esPM = periodo === "p." && meridiano === "m.";

    const hora24 = esPM
      ? horas === 12
        ? 12
        : horas + 12
      : horas === 12
        ? 0
        : horas;

    return `${String(hora24).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  };

  // GUARDAR RESERVA
  const ejecutarReserva = () => {
    const usuarioActual = obtenerUsuarioActivo();

    if (!usuarioActual) {
      window.alert(
        "Tu sesión no está activa. Inicia sesión nuevamente."
      );
      navigate("/essalud");
      return;
    }

    if (!pacienteSeleccionado?.dni) {
      window.alert(
        "No se identificó al paciente seleccionado."
      );
      return;
    }

    const resultado = guardarCita({
      // TITULAR QUE ADMINISTRA LA CUENTA
      usuarioId: usuarioActual.id,
      solicitanteId: usuarioActual.id,
      solicitanteNombre:
        usuarioActual.nombres ||
        usuarioActual.nombre ||
        "Titular",

      // PACIENTE QUE RECIBE LA ATENCIÓN
      pacienteId: String(pacienteSeleccionado.dni),
      pacienteNombre:
        pacienteSeleccionado.nombres ||
        pacienteSeleccionado.nombre ||
        "Paciente",

      // DATOS DE LA CITA
      tipo: tipoCita,
      paciente: esFamiliar ? "Familiar" : "Yo",
      especialidad,
      medico: medico.nombre,
      cmp: medico.cmp,
      fecha,
      horario,
      hora: convertirHora(horario),

      centroNombre:
        usuarioActual.centro?.nombre ||
        "Centro de atención asignado",

      estado: "Pendiente",
    });

    if (!resultado.correcto) {
      window.alert(
        resultado.mensaje || "No se pudo guardar la cita."
      );
      return;
    }

    setMostrarConfirmacion(false);
    setPaso(5);
  };

  // CONFIRMAR DESDE EL MODAL
  const aceptarReserva = () => {
    ejecutarReserva();
  };

  // NAVEGACIÓN INFERIOR
  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") navigate("/essalud/citas");
    if (id === "chat") navigate("/essalud/chat");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  return (
    <main className="appointments-screen reservar-screen">

      {/* ENCABEZADO */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={volver}
          aria-label="Volver"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>
          {paso === 5 ? "Cita reservada" : "Reservar cita"}
        </h1>

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
              "¿Necesitas ayuda para reservar tu cita?"
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* PROGRESO */}
      {paso < 5 && (
        <div
          className="reservar-progress"
          aria-label={`Paso ${paso} de 4`}
        >
          {pasos.map((item, index) => (
            <React.Fragment key={item.numero}>
              <div
                className={`reservar-step ${
                  paso >= item.numero ? "completed" : ""
                } ${paso === item.numero ? "current" : ""}`}
              >
                <span>
                  {paso > item.numero ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    item.numero
                  )}
                </span>

                <small>{item.texto}</small>
              </div>

              {index < pasos.length - 1 && (
                <div
                  className={`reservar-line ${
                    paso > item.numero ? "completed" : ""
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <section className="reservar-content">

        {/* PASO 1: TIPO DE CITA Y SELECCIÓN DEL PACIENTE */}
        {paso === 1 && (
          <div className="reservar-section">
            <p className="reservar-step-label">
              PASO 1 DE 4
            </p>

            <h2>¿Qué tipo de cita deseas?</h2>

            <p className="reservar-description">
              Selecciona cómo prefieres recibir tu atención.
            </p>

            <div className="reservar-type-grid">
              {[
                {
                  nombre: "Presencial",
                  descripcion: "En un establecimiento de salud",
                  icono: Building2,
                },
                {
                  nombre: "Virtual",
                  descripcion: "Atención por videollamada",
                  icono: Video,
                },
              ].map(({ nombre, descripcion, icono: Icono }) => (
                <button
                  key={nombre}
                  type="button"
                  className={`reservar-type-card ${
                    tipoCita === nombre ? "selected" : ""
                  }`}
                  onClick={() => setTipoCita(nombre)}
                >
                  <span className="reservar-type-icon">
                    <Icono size={28} />
                  </span>

                  <strong>{nombre}</strong>
                  <small>{descripcion}</small>

                  <span className="reservar-radio">
                    {tipoCita === nombre && <span />}
                  </span>
                </button>
              ))}
            </div>

            <h3>¿Para quién es la cita?</h3>

            <p className="reservar-description">
              Selecciona a la persona que recibirá la atención médica.
            </p>

            <div className="reservar-patients-list">
              {pacientesDisponibles.map((item) => {
                const seleccionado =
                  String(pacienteSeleccionado?.dni) ===
                  String(item.dni);

                const esTitular =
                  String(item.dni) === String(usuario?.dni);

                return (
                  <button
                    key={item.dni}
                    type="button"
                    className={`reservar-patient ${
                      seleccionado ? "selected" : ""
                    }`}
                    onClick={() => seleccionarPacienteReserva(item)}
                    aria-pressed={seleccionado}
                  >
                    <span className="reservar-avatar">
                      <UserRound size={22} />
                    </span>

                    <span>
                      <strong>
                        {item.nombres || item.nombre || "Paciente"}
                      </strong>

                      <small>
                        {esTitular
                          ? "Asegurado titular"
                          : item.relation ||
                            item.parentesco ||
                            "Familiar vinculado"}
                      </small>

                      <small>DNI: {item.dni}</small>
                    </span>

                    <span className="reservar-radio">
                      {seleccionado && <span />}
                    </span>
                  </button>
                );
              })}

              {pacientesDisponibles.length === 0 && (
                <p className="reservar-no-results">
                  No se encontraron pacientes vinculados a esta cuenta.
                </p>
              )}
            </div>

            <div className="reservar-notice">
              <MapPin size={21} />

              <span>
                <strong>Centro de atención</strong>
                <small>
                  {usuario?.centro?.nombre ||
                    "Centro de atención asignado"}
                </small>
              </span>
            </div>
          </div>
        )}

        {/* PASO 2: ESPECIALIDAD */}
        {paso === 2 && (
          <div className="reservar-section">
            <p className="reservar-step-label">
              PASO 2 DE 4
            </p>

            <div className="reservar-summary">
              <span className="reservar-summary-icon">
                {tipoCita === "Virtual" ? (
                  <Video size={23} />
                ) : (
                  <Building2 size={23} />
                )}
              </span>

              <span>
                <small>Tipo de cita</small>
                <strong>{tipoCita}</strong>
                <small>
                  Para:{" "}
                  {pacienteSeleccionado?.nombres ||
                    pacienteSeleccionado?.nombre}
                </small>
              </span>

              <button
                type="button"
                onClick={() => setPaso(1)}
              >
                Editar
              </button>
            </div>

            <h2>Selecciona una especialidad</h2>

            <p className="reservar-description">
              Elige la especialidad para ver los médicos disponibles.
            </p>

            <label className="reservar-search">
              <Search size={18} />

              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar especialidad"
              />
            </label>

            <div className="reservar-popular">
              <Sparkles size={16} />
              <span>Especialidades disponibles</span>
            </div>

            <div className="reservar-specialties">
              {resultados.map(
                ({ nombre, descripcion, icono: Icono }) => (
                  <button
                    key={nombre}
                    type="button"
                    className={`reservar-specialty ${
                      especialidad === nombre ? "selected" : ""
                    }`}
                    onClick={() => seleccionarEspecialidad(nombre)}
                  >
                    <span className="reservar-specialty-icon">
                      <Icono size={22} />
                    </span>

                    <span className="reservar-specialty-info">
                      <strong>{nombre}</strong>
                      <small>{descripcion}</small>
                    </span>

                    <ArrowRight size={18} />
                  </button>
                )
              )}

              {resultados.length === 0 && (
                <p className="reservar-no-results">
                  No encontramos esa especialidad. Prueba con otro nombre.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PASO 3: SELECCIÓN DE MÉDICO */}
        {paso === 3 && (
          <div className="reservar-section">
            <p className="reservar-step-label">
              PASO 3 DE 4
            </p>

            <div className="reservar-summary">
              <span className="reservar-summary-icon">
                <Stethoscope size={23} />
              </span>

              <span>
                <small>Especialidad seleccionada</small>
                <strong>{especialidad}</strong>
                <small>
                  {tipoCita} ·{" "}
                  {pacienteSeleccionado?.nombres ||
                    pacienteSeleccionado?.nombre}
                </small>
              </span>

              <button
                type="button"
                onClick={() => setPaso(2)}
              >
                Editar
              </button>
            </div>

            <h2>Selecciona un médico</h2>

            <p className="reservar-description">
              Elige al profesional de tu preferencia según su disponibilidad.
            </p>

            <div className="reservar-doctors">
              {medicosDisponibles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`reservar-doctor ${
                    medico?.id === item.id ? "selected" : ""
                  }`}
                  onClick={() => seleccionarMedico(item)}
                >
                  <span
                    className={`reservar-doctor-avatar ${item.color}`}
                  >
                    {item.iniciales}
                  </span>

                  <span className="reservar-doctor-info">
                    <strong>{item.nombre}</strong>
                    <small>{especialidad}</small>

                    <small className="reservar-cmp">
                      CMP {item.cmp}
                    </small>

                    <small className="reservar-availability">
                      <CalendarDays size={13} />
                      Disponible: {item.disponibilidad}
                    </small>
                  </span>

                  <span className="reservar-radio">
                    {medico?.id === item.id && <span />}
                  </span>
                </button>
              ))}
            </div>

            <div className="reservar-notice">
              <UserRoundCheck size={21} />

              <span>
                <strong>Elige tu médico</strong>
                <small>
                  Podrás seleccionar la fecha y hora después de escoger un
                  profesional.
                </small>
              </span>
            </div>
          </div>
        )}

        {/* PASO 4: FECHA Y HORARIO */}
        {paso === 4 && (
          <div className="reservar-section">
            <p className="reservar-step-label">
              PASO 4 DE 4
            </p>

            <div className="reservar-summary">
              <span className="reservar-summary-icon">
                <UserRoundCheck size={23} />
              </span>

              <span>
                <small>Médico seleccionado</small>
                <strong>{medico?.nombre}</strong>
                <small>{especialidad}</small>
              </span>

              <button
                type="button"
                onClick={() => setPaso(3)}
              >
                Editar
              </button>
            </div>

            <h2>Selecciona la fecha y horario</h2>

            <p className="reservar-description">
              Elige una fecha disponible y luego uno de los horarios.
            </p>

            <label className="reservar-date-label">
              <CalendarDays size={18} />
              Fecha de atención

              <input
                type="date"
                value={fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setHorario("");
                }}
              />
            </label>

            <h3 className="reservar-time-title">
              <Clock size={18} />
              Horarios disponibles
            </h3>

            <div className="reservar-times">
              {horarios.map((hora) => (
                <button
                  key={hora}
                  type="button"
                  disabled={!fecha}
                  className={horario === hora ? "selected" : ""}
                  onClick={() => setHorario(hora)}
                >
                  {hora}
                </button>
              ))}
            </div>

            <div className="reservar-notice">
              <MapPin size={21} />

              <span>
                <strong>Disponibilidad demostrativa</strong>
                <small>
                  Los horarios son de ejemplo para el prototipo; no se consulta
                  una agenda médica real.
                </small>
              </span>
            </div>
          </div>
        )}

        {/* PASO 5: CONFIRMACIÓN EXITOSA */}
        {paso === 5 && (
          <div className="reservar-success">
            <span className="reservar-success-icon">
              <CheckCircle2 size={58} />
            </span>

            <h2>¡Cita reservada!</h2>

            <p>
              Has completado el flujo de reserva en el prototipo.
            </p>

            <div className="reservar-confirmation">
              <h3>
                <ClipboardCheck size={18} />
                Detalles de la cita
              </h3>

              <p>
                <span>Tipo de cita</span>
                <strong>{tipoCita}</strong>
              </p>

              <p>
                <span>Especialidad</span>
                <strong>{especialidad}</strong>
              </p>

              <p>
                <span>Médico</span>
                <strong>
                  {medico?.nombre}
                  <small>CMP {medico?.cmp}</small>
                </strong>
              </p>

              <p>
                <span>Centro de atención</span>
                <strong>
                  {usuario?.centro?.nombre ||
                    "Centro de atención asignado"}
                </strong>
              </p>

              <p>
                <span>Paciente</span>
                <strong>
                  {pacienteSeleccionado?.nombres ||
                    pacienteSeleccionado?.nombre}
                </strong>
              </p>

              <p>
                <span>Gestionado por</span>
                <strong>
                  {usuario?.nombres || usuario?.nombre}
                </strong>
              </p>

              <p>
                <span>Fecha</span>
                <strong>{fechaBonita(fecha)}</strong>
              </p>

              <p>
                <span>Hora</span>
                <strong>{horario}</strong>
              </p>
            </div>

            <button
              className="reservar-primary"
              type="button"
              onClick={() => navigate("/essalud/citas")}
            >
              Ver mis citas <ArrowRight size={19} />
            </button>

            <button
              className="reservar-secondary"
              type="button"
              onClick={reiniciarReserva}
            >
              Reservar otra cita
            </button>
          </div>
        )}
      </section>

      {/* BOTÓN CONTINUAR */}
      {paso < 5 && (
        <footer className="reservar-footer">
          <button
            className="reservar-primary"
            type="button"
            onClick={paso === 4 ? confirmarReserva : continuar}
            disabled={
              (paso === 1 && !pacienteSeleccionado) ||
              (paso === 2 && !especialidad) ||
              (paso === 3 && !medico) ||
              (paso === 4 && (!fecha || !horario))
            }
          >
            Continuar <ArrowRight size={20} />
          </button>
        </footer>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmacionModal
        isOpen={mostrarConfirmacion}
        title="¿Estás seguro de reservar esta cita?"
        message="Verifica que los datos de tu cita sean correctos antes de confirmar la reserva."
        cancelText="No"
        confirmText="Sí"
        onCancel={() => setMostrarConfirmacion(false)}
        onConfirm={aceptarReserva}
      />

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation onNavigate={navegarMenu} />
    </main>
  );
}
