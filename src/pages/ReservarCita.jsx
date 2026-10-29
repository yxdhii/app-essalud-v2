import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CalendarCheck,
  Sparkles,
  UserRoundCheck,
  MapPin,
  ClipboardCheck,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

const especialidades = [
  { nombre: "Medicina General", descripcion: "Atención integral", icono: Stethoscope },
  { nombre: "Pediatría", descripcion: "Niños y adolescentes", icono: Baby },
  { nombre: "Ginecología y Obstetricia", descripcion: "Salud de la mujer", icono: HeartPulse },
  { nombre: "Psicología", descripcion: "Bienestar emocional", icono: Brain },
  { nombre: "Medicina Interna", descripcion: "Salud del adulto", icono: UserRound },
  { nombre: "Cardiología", descripcion: "Salud del corazón", icono: HeartPulse },
  { nombre: "Cirugía General", descripcion: "Evaluación y tratamiento", icono: UserRoundCheck },
  { nombre: "Dermatología", descripcion: "Cuidado de la piel", icono: Sparkles },
];

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

const pasos = [
  { numero: 1, texto: "Tipo de cita" },
  { numero: 2, texto: "Especialidad" },
  { numero: 3, texto: "Médico" },
  { numero: 4, texto: "Fecha y horario" },
];

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

  const [paso, setPaso] = useState(1);
  const [tipoCita, setTipoCita] = useState("Presencial");
  const [paciente, setPaciente] = useState("Yo");
  const [busqueda, setBusqueda] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [medico, setMedico] = useState(null);
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");

  const resultados = useMemo(
    () =>
      especialidades.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [busqueda]
  );

  const medicosDisponibles = useMemo(() => {
    const exactos = medicos.filter(
      (item) => item.especialidad === especialidad
    );

    if (exactos.length > 0) {
      return exactos;
    }

    return medicos.slice(0, 3).map((item) => ({
      ...item,
      especialidad,
    }));
  }, [especialidad]);

  const continuar = () => {
    if (paso === 1) {
      setPaso(2);
    } else if (paso === 2 && especialidad) {
      setPaso(3);
    } else if (paso === 3 && medico) {
      setPaso(4);
    } else if (paso === 4 && fecha && horario) {
      setPaso(5);
    }
  };

  const volver = () => {
    if (paso > 1 && paso <= 4) {
      setPaso(paso - 1);
    } else if (paso === 5) {
      setPaso(4);
    } else {
      navigate("/essalud/inicio");
    }
  };

  const seleccionarEspecialidad = (nombre) => {
    setEspecialidad(nombre);
    setMedico(null);
    setFecha("");
    setHorario("");
  };

  const seleccionarMedico = (item) => {
    setMedico(item);
    setFecha("");
    setHorario("");
  };

  const reiniciarReserva = () => {
    setPaso(1);
    setTipoCita("Presencial");
    setPaciente("Yo");
    setBusqueda("");
    setEspecialidad("");
    setMedico(null);
    setFecha("");
    setHorario("");
  };

  return (
    <main className="reservar-screen">
      {/* ENCABEZADO */}
      <header className="reservar-header">
        <button
          className="reservar-back"
          onClick={volver}
          aria-label="Volver"
          type="button"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>{paso === 5 ? "Cita reservada" : "Reservar cita"}</h1>

        <img
          className="reservar-logo"
          src={logoEssalud}
          alt="EsSalud Digital"
        />

        <button
          className="reservar-help"
          aria-label="Ayuda"
          type="button"
          onClick={() =>
            window.alert("¿Necesitas ayuda para reservar tu cita?")
          }
        >
          <CircleHelp size={22} />
        </button>
      </header>

      {/* PROGRESO DE LOS CUATRO PASOS */}
      {paso < 5 && (
        <div className="reservar-progress" aria-label={`Paso ${paso} de 4`}>
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
        {/* PASO 1: TIPO DE CITA */}
        {paso === 1 && (
          <div className="reservar-section">
            <p className="reservar-step-label">PASO 1 DE 4</p>

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

            {[
              {
                nombre: "Yo",
                titulo: "Para mí",
                descripcion: "Asegurado titular",
                icono: UserRound,
              },
              {
                nombre: "Familiar",
                titulo: "Familiar",
                descripcion: "Atención para un familiar",
                icono: HeartPulse,
              },
            ].map(({ nombre, titulo, descripcion, icono: Icono }) => (
              <button
                key={nombre}
                type="button"
                className={`reservar-patient ${
                  paciente === nombre ? "selected" : ""
                }`}
                onClick={() => setPaciente(nombre)}
              >
                <span className="reservar-avatar">
                  <Icono size={22} />
                </span>

                <span>
                  <strong>{titulo}</strong>
                  <small>{descripcion}</small>
                </span>

                <span className="reservar-radio">
                  {paciente === nombre && <span />}
                </span>
              </button>
            ))}

            <div className="reservar-notice">
              <CalendarCheck size={21} />
              <span>
                <strong>Ten en cuenta</strong>
                <small>
                  La disponibilidad depende de la especialidad y del
                  establecimiento seleccionado.
                </small>
              </span>
            </div>
          </div>
        )}

        {/* PASO 2: ESPECIALIDAD */}
        {paso === 2 && (
          <div className="reservar-section">
            <p className="reservar-step-label">PASO 2 DE 4</p>

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
                  {paciente === "Yo" ? "Para mí" : "Para un familiar"}
                </small>
              </span>

              <button type="button" onClick={() => setPaso(1)}>
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
            <p className="reservar-step-label">PASO 3 DE 4</p>

            <div className="reservar-summary">
              <span className="reservar-summary-icon">
                <Stethoscope size={23} />
              </span>

              <span>
                <small>Especialidad seleccionada</small>
                <strong>{especialidad}</strong>
                <small>
                  {tipoCita} · {paciente === "Yo" ? "Para mí" : "Familiar"}
                </small>
              </span>

              <button type="button" onClick={() => setPaso(2)}>
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
            <p className="reservar-step-label">PASO 4 DE 4</p>

            <div className="reservar-summary">
              <span className="reservar-summary-icon">
                <UserRoundCheck size={23} />
              </span>

              <span>
                <small>Médico seleccionado</small>
                <strong>{medico?.nombre}</strong>
                <small>{especialidad}</small>
              </span>

              <button type="button" onClick={() => setPaso(3)}>
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

        {/* PASO 5: CONFIRMACIÓN */}
        {paso === 5 && (
          <div className="reservar-success">
            <span className="reservar-success-icon">
              <CheckCircle2 size={58} />
            </span>

            <h2>¡Cita reservada!</h2>

            <p>Has completado el flujo de reserva en el prototipo.</p>

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
                <span>Paciente</span>
                <strong>
                  {paciente === "Yo" ? "Para mí" : "Familiar"}
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

            <p className="reservar-demo-note">
              Esta confirmación es demostrativa. No se ha reservado una cita
              real.
            </p>

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
            onClick={continuar}
            disabled={
              (paso === 2 && !especialidad) ||
              (paso === 3 && !medico) ||
              (paso === 4 && (!fecha || !horario))
            }
          >
            Continuar <ArrowRight size={20} />
          </button>
        </footer>
      )}

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation
        active="citas"
        onNavigate={(id) => {
          const rutas = {
            inicio: "/essalud/inicio",
            citas: "/essalud/citas",
          };

          if (rutas[id]) {
            navigate(rutas[id]);
          } else {
            window.alert(
              "Esta sección estará disponible en el siguiente avance del prototipo."
            );
          }
        }}
      />
    </main>
  );
}