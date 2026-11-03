

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

    disponibilidad: "Lunes y miércoles",

    iniciales: "CM",

    color: "azul",

    experiencia: "12 años de experiencia",

    descripcion: "Atención integral y preventiva para adultos.",

    frecuente: true,

  },

  {

    id: 2,

    nombre: "Dra. Ana Torres",

    especialidad: "Medicina General",

    cmp: "98765",

    disponibilidad: "Martes y jueves",

    iniciales: "AT",

    color: "rosa",

    experiencia: "9 años de experiencia",

    descripcion: "Evaluación general y seguimiento médico.",

    frecuente: true,

  },

  {

    id: 3,

    nombre: "Dr. Luis Ramírez",

    especialidad: "Medicina General",

    cmp: "56789",

    disponibilidad: "Miércoles y viernes",

    iniciales: "LR",

    color: "verde",

    experiencia: "8 años de experiencia",

    descripcion: "Diagnóstico y atención primaria.",

  },

  {

    id: 4,

    nombre: "Dra. María Rojas",

    especialidad: "Pediatría",

    cmp: "72314",

    disponibilidad: "Martes y jueves",

    iniciales: "MR",

    color: "rosa",

    experiencia: "10 años de experiencia",

    descripcion: "Atención médica para niños y adolescentes.",

    frecuente: true,

  },

  {

    id: 5,

    nombre: "Dr. José Castillo",

    especialidad: "Cardiología",

    cmp: "61248",

    disponibilidad: "Lunes y viernes",

    iniciales: "JC",

    color: "azul",

    experiencia: "15 años de experiencia",

    descripcion: "Evaluación y cuidado de la salud cardiovascular.",

  },

  {

    id: 6,

    nombre: "Dra. Elena Vargas",

    especialidad: "Ginecología y Obstetricia",

    cmp: "84321",

    disponibilidad: "Lunes y miércoles",

    iniciales: "EV",

    color: "verde",

    experiencia: "11 años de experiencia",

    descripcion: "Salud integral de la mujer.",

  },

  {

    id: 7,

    nombre: "Dra. Lucía Fernández",

    especialidad: "Psicología",

    cmp: "75421",

    disponibilidad: "Martes y viernes",

    iniciales: "LF",

    color: "rosa",

    experiencia: "8 años de experiencia",

    descripcion: "Orientación y acompañamiento psicológico.",

    frecuente: true,

  },

  {

    id: 8,

    nombre: "Dr. Andrés Paredes",

    especialidad: "Psicología",

    cmp: "84512",

    disponibilidad: "Lunes y jueves",

    iniciales: "AP",

    color: "azul",

    experiencia: "10 años de experiencia",

    descripcion: "Bienestar emocional y atención psicológica.",

  },

  {

    id: 9,

    nombre: "Dr. Roberto Salas",

    especialidad: "Medicina Interna",

    cmp: "63214",

    disponibilidad: "Lunes y miércoles",

    iniciales: "RS",

    color: "verde",

    experiencia: "14 años de experiencia",

    descripcion: "Evaluación y tratamiento de enfermedades del adulto.",

  },

  {

    id: 10,

    nombre: "Dra. Patricia León",

    especialidad: "Cirugía General",

    cmp: "72145",

    disponibilidad: "Martes y viernes",

    iniciales: "PL",

    color: "rosa",

    experiencia: "13 años de experiencia",

    descripcion: "Evaluación quirúrgica y seguimiento.",

  },

  {

    id: 11,

    nombre: "Dr. Miguel Herrera",

    especialidad: "Dermatología",

    cmp: "81934",

    disponibilidad: "Miércoles y jueves",

    iniciales: "MH",

    color: "azul",

    experiencia: "9 años de experiencia",

    descripcion: "Diagnóstico y cuidado de enfermedades de la piel.",

  },

];



// HORARIOS

const horarios = [
  "8:00 a. m.", "8:20 a. m.", "8:40 a. m.",
  "9:00 a. m.", "9:20 a. m.", "9:40 a. m.",
  "10:00 a. m.", "10:20 a. m.", "10:40 a. m.",
  "11:00 a. m.", "11:20 a. m.", "11:40 a. m.",
  "12:00 p. m.", "12:20 p. m.", "12:40 p. m.",
  "3:00 p. m.", "3:20 p. m.", "3:40 p. m.",
  "4:00 p. m.", "4:20 p. m.", "4:40 p. m.",
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

const nombresMeses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const diasSemana = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function fechaISOLocal(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sumarMeses(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

export default function ReservarCita() {

  const navigate = useNavigate();

  const location = useLocation();



  // USUARIO TITULAR QUE TIENE LA SESIÓN ACTIVA*

  const usuario = obtenerUsuarioActivo();



  // CONTEXTO GLOBAL DEL PACIENTE*

  const {

    pacienteSeleccionado: pacienteContexto,

    seleccionarPaciente: cambiarPacienteActivo,

  } = usePaciente();



  // FAMILIARES VINCULADOS AL TITULAR*

  const familiares = usuario

    ? obtenerFamiliaresVinculados(usuario.dni) || []

    : [];



  // LISTA DE PACIENTES: TITULAR + FAMILIARES*

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



  // OBTENER PACIENTE RECIBIDO O PACIENTE DEL CONTEXTO*

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



  // MANTENER SINCRONIZADO EL PACIENTE CON EL CONTEXTO GLOBAL*

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



  // IDENTIFICAR SI EL PACIENTE ES UN FAMILIAR*

  const esFamiliar =

    pacienteSeleccionado &&

    usuario &&

    String(pacienteSeleccionado.dni) !== String(usuario.dni);



  // ESTADOS DE LA RESERVA*

  const [paso, setPaso] = useState(1);

  const [tipoCita, setTipoCita] = useState("Presencial");

  const [busqueda, setBusqueda] = useState("");

  const [especialidad, setEspecialidad] = useState("");

  const [medico, setMedico] = useState(null);

  const [fecha, setFecha] = useState("");

  const [horario, setHorario] = useState("");
  const [mesCalendario, setMesCalendario] = useState(() => {
    const base = new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });



  // MODAL*

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);



  // FILTRAR ESPECIALIDADES*

  const resultados = useMemo(

    () =>

      especialidades.filter((item) =>

        item.nombre.toLowerCase().includes(busqueda.toLowerCase())

      ),

    [busqueda]

  );



  // MÉDICOS DISPONIBLES*

  const medicosDisponibles = useMemo(() => {

    if (!especialidad) return [];



    return medicos.filter(

      (item) => item.especialidad === especialidad

    );

  }, [especialidad]);

  const hoyISO = fechaISOLocal(new Date());
  const primerDiaMes = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), 1);
  const diasEnMes = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1, 0).getDate();
  const espaciosInicio = primerDiaMes.getDay();
  const celdasCalendario = [
    ...Array.from({ length: espaciosInicio }, (_, i) => ({ key: `v-${i}`, vacio: true })),
    ...Array.from({ length: diasEnMes }, (_, i) => {
      const dia = i + 1;
      const fechaDia = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), dia);
      const iso = fechaISOLocal(fechaDia);
      const pasado = iso < hoyISO;
      // Disponibilidad ficticia para el prototipo: domingos no disponibles y algunos días agotados.
      const agotado = !pasado && (fechaDia.getDay() === 0 || dia % 7 === 0);
      return { key: iso, dia, iso, pasado, agotado, disponible: !pasado && !agotado };
    }),
  ];

  const fechaSeleccionada = fecha ? new Date(`${fecha}T12:00:00`) : null;
  const fechaTieneDisponibilidad = fechaSeleccionada && fecha >= hoyISO && fechaSeleccionada.getDay() !== 0 && fechaSeleccionada.getDate() % 7 !== 0;



  // SELECCIONAR PACIENTE PARA LA RESERVA*

  const seleccionarPacienteReserva = (paciente) => {

    setPacienteSeleccionado(paciente);



    // Actualizar el contexto global sin cambiar la sesión del titular.*

    if (usuario?.dni && paciente?.dni) {

      cambiarPacienteActivo(paciente, usuario);

    }

  };



  // CONTINUAR ENTRE PASOS*

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



  // VOLVER*

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



  // SELECCIONAR ESPECIALIDAD*

  const seleccionarEspecialidad = (nombre) => {

    setEspecialidad(nombre);

    setMedico(null);

    setFecha("");

    setHorario("");

  };



  // SELECCIONAR MÉDICO*

  const seleccionarMedico = (item) => {

    setMedico(item);

    setFecha("");

    setHorario("");

  };



  // REINICIAR RESERVA*

  const reiniciarReserva = () => {

    setPaso(1);

    setTipoCita("Presencial");

    setBusqueda("");

    setEspecialidad("");

    setMedico(null);

    setFecha("");

    setHorario("");

    setMostrarConfirmacion(false);



    // Conservamos al paciente seleccionado.*

  };



  // MOSTRAR MODAL ANTES DE RESERVAR*

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



  // CONVERTIR HORARIO A FORMATO DE 24 HORAS*

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



  // GUARDAR RESERVA*

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

      // TITULAR QUE ADMINISTRA LA CUENTA*

      usuarioId: usuarioActual.id,

      solicitanteId: usuarioActual.id,

      solicitanteNombre:

        usuarioActual.nombres ||

        usuarioActual.nombre ||

        "Titular",



      // PACIENTE QUE RECIBE LA ATENCIÓN*

      pacienteId: String(pacienteSeleccionado.dni),

      pacienteNombre:

        pacienteSeleccionado.nombres ||

        pacienteSeleccionado.nombre ||

        "Paciente",



      // DATOS DE LA CITA*

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



  // CONFIRMAR DESDE EL MODAL*

  const aceptarReserva = () => {

    ejecutarReserva();

  };



  // NAVEGACIÓN INFERIOR*

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

    <p className="reservar-step-label">PASO 3 DE 4</p>



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



      <button type="button" onClick={() => setPaso(2)}>

        Editar

      </button>

    </div>



    <h2>Selecciona un médico</h2>



    <p className="reservar-description">

      Conoce a nuestros profesionales y elige quién deseas que te atienda.

    </p>



    {medicosDisponibles.length > 0 ? (

      <>

        <div className="reservar-doctors">

          {medicosDisponibles.map((item) => (

            <button

              key={item.id}

              type="button"

              className={`reservar-doctor ${

                medico?.id === item.id ? "selected" : ""

              }`}

              onClick={() => seleccionarMedico(item)}

              aria-pressed={medico?.id === item.id}

            >

              <span className={`reservar-doctor-avatar ${item.color}`}>

                {item.iniciales}

              </span>



              <span className="reservar-doctor-info">

                <strong>{item.nombre}</strong>



                <small>{item.especialidad}</small>



                <small className="reservar-cmp">

                  CMP {item.cmp}

                </small>



                <small className="reservar-availability">

                  <CalendarDays size={13} />

                  {item.disponibilidad}

                </small>



                {item.frecuente && (

                  <small className="reservar-frequent">

                    <Sparkles size={12} />

                    Médico frecuente

                  </small>

                )}

              </span>



              <span className="reservar-radio">

                {medico?.id === item.id && <span />}

              </span>

            </button>

          ))}

        </div>



        {medico && (

          <div className="reservar-doctor-detail">

            <div className="reservar-doctor-detail-heading">

              <CheckCircle2 size={19} />

              <strong>Médico seleccionado</strong>

            </div>



            <h3>{medico.nombre}</h3>



            <p>{medico.descripcion}</p>



            <div className="reservar-doctor-detail-info">

              <span>

                <Stethoscope size={15} />

                {medico.experiencia}

              </span>



              <span>

                <CalendarDays size={15} />

                {medico.disponibilidad}

              </span>

            </div>



            <button

              type="button"

              className="reservar-view-schedule"

              onClick={() => setPaso(4)}

            >

              Ver horarios disponibles

              <ArrowRight size={18} />

            </button>

          </div>

        )}

      </>

    ) : (

      <div className="reservar-empty-doctors">

        <span>

          <Stethoscope size={32} />

        </span>



        <strong>No hay médicos disponibles</strong>



        <p>

          Por el momento no encontramos profesionales registrados

          para esta especialidad.

        </p>



        <button type="button" onClick={() => setPaso(2)}>

          Elegir otra especialidad

        </button>

      </div>

    )}

  </div>

)}



        {/* PASO 4: FECHA Y HORARIO */}
        {paso === 4 && (
          <div className="reservar-section reservar-calendar-section">
            <p className="reservar-step-label">PASO 4 DE 4</p>

            <div className="reservar-summary">
              <span className="reservar-summary-icon"><UserRoundCheck size={23} /></span>
              <span>
                <small>Médico seleccionado</small>
                <strong>{medico?.nombre}</strong>
                <small>{especialidad} · {tipoCita}</small>
              </span>
              <button type="button" onClick={() => setPaso(3)}>Editar</button>
            </div>

            <div className="reservar-calendar-heading">
              <div>
                <span className="reservar-calendar-eyebrow">ÚLTIMO PASO</span>
                <h2>Elige tu fecha y hora</h2>
                <p className="reservar-description">Selecciona un día disponible y encuentra el horario que mejor te convenga.</p>
              </div>
              <span className="reservar-calendar-heading-icon"><CalendarDays size={25} /></span>
            </div>

            <div className="reservar-calendar-card">
              <div className="reservar-calendar-monthbar">
                <button type="button" aria-label="Mes anterior" onClick={() => setMesCalendario((actual) => sumarMeses(actual, -1))} disabled={mesCalendario.getFullYear() === new Date().getFullYear() && mesCalendario.getMonth() === new Date().getMonth()}>
                  <ArrowLeft size={18} />
                </button>
                <h3>{nombresMeses[mesCalendario.getMonth()]} de {mesCalendario.getFullYear()}</h3>
                <button type="button" aria-label="Mes siguiente" onClick={() => setMesCalendario((actual) => sumarMeses(actual, 1))}>
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="reservar-calendar-grid" role="group" aria-label="Calendario de disponibilidad">
                {diasSemana.map((dia) => <span className="reservar-calendar-weekday" key={dia}>{dia}</span>)}
                {celdasCalendario.map((celda) => {
                  if (celda.vacio) return <span className="reservar-calendar-empty" key={celda.key} />;
                  const seleccionado = fecha === celda.iso;
                  return (
                    <button
                      key={celda.key}
                      type="button"
                      className={`reservar-calendar-day ${seleccionado ? "selected" : ""} ${celda.pasado ? "past" : ""} ${celda.agotado ? "sold-out" : ""}`}
                      disabled={!celda.disponible}
                      aria-label={`${celda.dia} de ${nombresMeses[mesCalendario.getMonth()]}${celda.agotado ? ", agotado" : celda.pasado ? ", no disponible" : ", disponible"}`}
                      aria-pressed={seleccionado}
                      onClick={() => { setFecha(celda.iso); setHorario(""); setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), 1)); }}
                    >
                      {celda.dia}
                    </button>
                  );
                })}
              </div>

              <div className="reservar-calendar-legend">
                <span><i className="available" />Disponible</span>
                <span><i className="unavailable" />Agotado</span>
                <span><i className="chosen" />Elegido</span>
              </div>
            </div>

            <section className={`reservar-slots-card ${!fecha ? "is-locked" : ""}`} aria-live="polite">
              <div className="reservar-slots-heading">
                <div>
                  <h3><Clock size={19} /> Horarios disponibles</h3>
                  <p>{fecha ? fechaBonita(fecha) : "Primero selecciona una fecha en el calendario"}</p>
                </div>
                {horario && <span className="reservar-slot-count"><CheckCircle2 size={15} /> Seleccionado</span>}
              </div>

              {!fecha ? (
                <div className="reservar-slots-placeholder"><CalendarDays size={22} /><span>Los horarios aparecerán aquí cuando elijas un día.</span></div>
              ) : !fechaTieneDisponibilidad ? (
                <div className="reservar-slots-placeholder"><Clock size={22} /><span>No hay horarios para esta fecha. Elige otro día.</span></div>
              ) : (
                <div className="reservar-times reservar-calendar-times">
                  {horarios.map((hora, index) => {
                    const bloqueado = index === 2 || index === 7 || index === 13;
                    return (
                      <button key={hora} type="button" disabled={bloqueado} className={`${horario === hora ? "selected" : ""} ${bloqueado ? "slot-unavailable" : ""}`} onClick={() => setHorario(hora)}>
                        {hora.replace(" a. m.", "").replace(" p. m.", "")}
                        <small>{hora.includes("p. m.") ? "p. m." : "a. m."}</small>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="reservar-calendar-disclaimer">
              <MapPin size={17} />
              <span><strong>Disponibilidad demostrativa</strong><small>Los días y horarios son referenciales para este prototipo; no se consulta una agenda médica real.</small></span>
            </div>

            {fecha && horario && (
              <div className="reservar-selection-summary">
                <CheckCircle2 size={20} />
                <span><small>Tu cita seleccionada</small><strong>{fechaBonita(fecha)} · {horario}</strong></span>
              </div>
            )}
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



      {/* ACCIONES DEL PASO */}
      {paso < 5 && paso !== 3 && (
        <footer className={`reservar-footer ${paso === 4 ? "reservar-footer-calendar" : ""}`}>
          {paso === 4 ? (
            <>
              <button className="reservar-primary" type="button" onClick={confirmarReserva} disabled={!fecha || !horario}>
                <CheckCircle2 size={19} /> Confirmar cita
              </button>
              <button className="reservar-secondary" type="button" onClick={() => { setFecha(""); setHorario(""); }}>
                Cancelar selección
              </button>
            </>
          ) : (
            <button className="reservar-primary" type="button" onClick={continuar} disabled={(paso === 1 && !pacienteSeleccionado) || (paso === 2 && !especialidad)}>
              Continuar <ArrowRight size={20} />
            </button>
          )}
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
