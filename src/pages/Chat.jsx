import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  CalendarDays,
  FileText,
  FlaskConical,
  Paperclip,
  Send,
  ShieldCheck,
  CheckCheck,
  MapPin,
  X,
  Image as ImageIcon,
  Camera,
  Mic,
  Square,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import asistenteSalud from "../assets/asistente-salud.png";
import BottomNavigation from "../components/BottomNavigation";
import { obtenerUsuarioActivo } from "../services/usuariosService.js";

// =========================================
// RUTAS
// =========================================

const RUTAS = {
  inicio: "/essalud/inicio",
  citas: "/essalud/citas",
  reservarCita: "/essalud/reservar-cita",
  chat: "/essalud/chat",
  perfil: "/essalud/perfil",
  recetas: "/essalud/recetas",
  examenes: "/essalud/examenes",
  centros: "/essalud/centros-atencion",
};

export default function Chat() {
  const navigate = useNavigate();

  const mensajesRef = useRef(null);
  const respuestaPendiente = useRef(null);
  const reconocimientoRef = useRef(null);
  const textoBaseRef = useRef("");
  const textoReconocidoRef = useRef("");

  const [grabando, setGrabando] = useState(false);
  const [errorMicrofono, setErrorMicrofono] = useState("");

  // =========================================
  // IDENTIFICAR AL USUARIO ACTIVO
  // =========================================

  const usuario = obtenerUsuarioActivo();

  const nombreCompleto =
    usuario?.nombres ||
    usuario?.nombre ||
    usuario?.name ||
    usuario?.fullName ||
    "";

  const nombreUsuario =
    String(nombreCompleto).trim().split(/\s+/)[0] || "Usuario";

  const identificadorUsuario =
    usuario?.id ||
    usuario?.idUsuario ||
    usuario?.dni ||
    usuario?.documento ||
    usuario?.email ||
    "usuario";

  const claveChat = `essalud_chat_historial_${identificadorUsuario}`;

  // =========================================
  // REFERENCIAS PARA ARCHIVOS
  // =========================================

  const documentoRef = useRef(null);
  const galeriaRef = useRef(null);
  const camaraRef = useRef(null);

  // =========================================
  // FUNCIONES GENERALES
  // =========================================

  const obtenerHora = () =>
    new Date().toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const normalizarTexto = (texto = "") =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const contieneAlguna = (texto, palabras) =>
    palabras.some((palabra) => texto.includes(palabra));

  // =========================================
  // MENSAJE DE BIENVENIDA
  // =========================================

  const obtenerMensajesIniciales = () => [
    {
      id: `bienvenida-${identificadorUsuario}`,
      tipo: "asistente",
      texto: `¡Hola, ${nombreUsuario}! 👋

Soy tu asistente virtual de EsSalud Digital.

Estoy aquí para orientarte y ayudarte a utilizar los servicios de nuestra plataforma.

Puedes preguntarme sobre citas médicas, recetas, exámenes y centros de atención.

¿Qué te gustaría consultar hoy?`,
      hora: obtenerHora(),
    },
  ];

  // =========================================
  // ESTADOS
  // =========================================

  const [mensaje, setMensaje] = useState("");
  const [respondiendo, setRespondiendo] = useState(false);

  const [mostrarAdjuntos, setMostrarAdjuntos] = useState(false);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);

  const [mensajes, setMensajes] = useState(() => {
    try {
      const historial = localStorage.getItem(claveChat);

      if (historial) {
        const mensajesGuardados = JSON.parse(historial);

        if (Array.isArray(mensajesGuardados)) {
          return mensajesGuardados;
        }
      }

      return obtenerMensajesIniciales();
    } catch (error) {
      console.error("Error al recuperar el historial:", error);
      return obtenerMensajesIniciales();
    }
  });

  // =========================================
  // GUARDAR HISTORIAL
  // =========================================

  useEffect(() => {
    try {
      localStorage.setItem(claveChat, JSON.stringify(mensajes));
    } catch (error) {
      console.error("Error al guardar el historial:", error);
    }
  }, [mensajes, claveChat]);

  // =========================================
  // DESPLAZAMIENTO AUTOMÁTICO
  // =========================================

  useEffect(() => {
    const contenedor = mensajesRef.current;

    if (contenedor) {
      contenedor.scrollTo({
        top: contenedor.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mensajes, respondiendo]);

  // =========================================
  // LIMPIAR TEMPORIZADOR
  // =========================================

  useEffect(() => {
    return () => {
      if (respuestaPendiente.current) {
        window.clearTimeout(respuestaPendiente.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (reconocimientoRef.current) {
        reconocimientoRef.current.abort();
        reconocimientoRef.current = null;
      }
    };
  }, []);

  // =========================================
  // TRANSCRIPCIÓN POR VOZ
  // =========================================

  const iniciarGrabacion = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMicrofono(
        "Tu navegador no admite el reconocimiento de voz. Prueba con Google Chrome.",
      );
      return;
    }

    setErrorMicrofono("");

    const reconocimiento = new SpeechRecognition();

    reconocimiento.lang = "es-PE";
    reconocimiento.continuous = true;
    reconocimiento.interimResults = true;

    textoBaseRef.current = mensaje.trim();
    textoReconocidoRef.current = "";

    reconocimiento.onstart = () => {
      setGrabando(true);
    };

    reconocimiento.onresult = (event) => {
      let textoFinal = "";
      let textoTemporal = "";

      for (let i = 0; i < event.results.length; i++) {
        const resultado = event.results[i];
        const texto = resultado[0].transcript;

        if (resultado.isFinal) {
          textoFinal += texto + " ";
        } else {
          textoTemporal += texto;
        }
      }

      textoReconocidoRef.current = textoFinal.trim();

      const textoCompleto = [
        textoBaseRef.current,
        textoReconocidoRef.current,
        textoTemporal,
      ]
        .filter(Boolean)
        .join(" ");

      setMensaje(textoCompleto);
    };

    reconocimiento.onerror = (event) => {
      setGrabando(false);

      if (event.error === "not-allowed") {
        setErrorMicrofono(
          "Necesitas permitir el acceso al micrófono en tu navegador.",
        );
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setErrorMicrofono("No se pudo reconocer tu voz. Inténtalo nuevamente.");
      }
    };

    reconocimiento.onend = () => {
      setGrabando(false);
    };

    reconocimientoRef.current = reconocimiento;

    try {
      reconocimiento.start();
    } catch (error) {
      setGrabando(false);
      setErrorMicrofono("No se pudo iniciar el micrófono.");
    }
  };

  const detenerGrabacion = () => {
    if (reconocimientoRef.current) {
      reconocimientoRef.current.stop();
      reconocimientoRef.current = null;
    }

    setGrabando(false);
  };
  // =========================================
  // ADJUNTAR ARCHIVOS
  // =========================================

  const manejarAdjunto = () => {
    setMostrarAdjuntos((anterior) => !anterior);
  };

  const seleccionarArchivo = (event, tipo) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    const tiposPermitidos = {
      documento: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      multimedia: ["image/", "video/"],
    };

    if (tipo === "documento") {
      const extensionValida = /\.(pdf|doc|docx|xls|xlsx)$/i.test(archivo.name);

      if (!extensionValida) {
        window.alert("Selecciona un documento PDF, Word o Excel.");
        event.target.value = "";
        return;
      }
    }

    if (
      tipo === "multimedia" &&
      !tiposPermitidos.multimedia.some((tipoArchivo) =>
        archivo.type.startsWith(tipoArchivo),
      )
    ) {
      window.alert("Selecciona una imagen o un video válido.");
      event.target.value = "";
      return;
    }

    setArchivoAdjunto({
      nombre: archivo.name,
      tipo: archivo.type,
      tamanio: archivo.size,
    });

    setMostrarAdjuntos(false);

    // Permite volver a seleccionar el mismo archivo.
    event.target.value = "";
  };

  const eliminarAdjunto = () => {
    setArchivoAdjunto(null);
  };

  // =========================================
  // GENERAR RESPUESTAS DEL ASISTENTE
  // =========================================

  const generarRespuesta = (texto) => {
    const consulta = normalizarTexto(texto);

    // RESERVAR UNA NUEVA CITA

    if (
      contieneAlguna(consulta, [
        "reservar",
        "reserva de cita",
        "sacar una cita",
        "sacar cita",
        "agendar",
        "programar una cita",
        "quiero una cita",
        "necesito una cita",
        "obtener una cita",
        "separar una cita",
        "pedir una cita",
        "solicitar una cita",
        "como reservo",
        "como puedo reservar",
      ])
    ) {
      return {
        texto: `¡Claro, ${nombreUsuario}! 😊

Puedes reservar tu cita médica desde EsSalud Digital.

Ingresa al apartado de reservas, selecciona el tipo de atención, la especialidad y el médico de tu preferencia.

Después podrás elegir la fecha y el horario disponible.

¡Haz clic en el siguiente botón para comenzar! 💙`,
        accion: {
          texto: "Reservar mi cita",
          ruta: RUTAS.reservarCita,
          icono: "cita",
        },
      };
    }

    // CANCELAR O REPROGRAMAR UNA CITA

    if (
      contieneAlguna(consulta, [
        "cancelar",
        "anular",
        "reprogramar",
        "cambiar la fecha",
        "modificar la cita",
        "cambiar mi cita",
      ]) &&
      consulta.includes("cita")
    ) {
      return {
        texto: `Puedes ingresar a Mis citas para revisar tus reservas y consultar las opciones disponibles para gestionar tu atención médica.

Te llevaré a esa sección para que puedas revisarlas.`,
        accion: {
          texto: "Ir a Mis citas",
          ruta: RUTAS.citas,
          icono: "cita",
        },
      };
    }

    // CONSULTAR CITAS EXISTENTES

    if (
      contieneAlguna(consulta, [
        "mis citas",
        "proximas citas",
        "ver mis citas",
        "consultar cita",
        "consultar mis citas",
        "cuando es mi cita",
        "fecha de mi cita",
        "tengo una cita",
        "cita programada",
        "citas pendientes",
        "mostrar mis citas",
        "donde veo mis citas",
      ])
    ) {
      return {
        texto: `¡Por supuesto, ${nombreUsuario}! 😊

Desde Mis citas puedes consultar tus próximas atenciones médicas, revisar las fechas programadas y conocer los detalles de tus reservas.`,
        accion: {
          texto: "Consultar mis citas",
          ruta: RUTAS.citas,
          icono: "cita",
        },
      };
    }

    // ESPECIALIDADES MÉDICAS

    if (
      contieneAlguna(consulta, [
        "especialidad",
        "especialidades",
        "especialista",
        "medico",
        "doctor",
        "pediatra",
        "cardiologo",
        "dermatologo",
        "ginecologo",
        "odontologo",
      ])
    ) {
      return {
        texto: `En el proceso de reserva podrás consultar las especialidades disponibles y seleccionar la atención médica que necesitas.

Puedes ingresar aquí para comenzar a buscar tu cita. 💙`,
        accion: {
          texto: "Buscar especialidades",
          ruta: RUTAS.reservarCita,
          icono: "cita",
        },
      };
    }

    // RECETAS MÉDICAS

    if (
      contieneAlguna(consulta, [
        "receta",
        "recetas",
        "medicamento",
        "medicamentos",
        "medicina",
        "medicinas",
        "prescripcion",
        "tratamiento indicado",
      ])
    ) {
      return {
        texto: `¡Claro que sí! 💊

En la sección Recetas puedes revisar la información de tus prescripciones médicas y consultar los medicamentos indicados por tu profesional de salud.

Ingresa aquí para revisar esta información.`,
        accion: {
          texto: "Ver mis recetas",
          ruta: RUTAS.recetas,
          icono: "receta",
        },
      };
    }

    // EXÁMENES MÉDICOS

    if (
      contieneAlguna(consulta, [
        "examen",
        "examenes",
        "laboratorio",
        "analisis",
        "resultado",
        "resultados",
        "pruebas medicas",
      ])
    ) {
      return {
        texto: `Puedes consultar la información de tus exámenes médicos y revisar los resultados que se encuentren disponibles en la plataforma.

Te dejo el acceso directo a esta sección. 🧪`,
        accion: {
          texto: "Consultar mis exámenes",
          ruta: RUTAS.examenes,
          icono: "examen",
        },
      };
    }

    // CENTROS DE ATENCIÓN

    if (
      contieneAlguna(consulta, [
        "hospital",
        "centro medico",
        "centros medicos",
        "centro de atencion",
        "centros de atencion",
        "establecimiento de salud",
        "policlinico",
        "ubicacion",
        "direccion",
        "donde queda",
        "donde encuentro",
        "buscar un centro",
      ])
    ) {
      return {
        texto: `¡Te ayudo a encontrarlo! 📍

En Centros de atención puedes consultar los establecimientos de salud disponibles y revisar su ubicación.

Ingresa aquí para encontrar el centro que necesitas.`,
        accion: {
          texto: "Buscar centros de atención",
          ruta: RUTAS.centros,
          icono: "centro",
        },
      };
    }

    // PERFIL Y CUENTA

    if (
      contieneAlguna(consulta, [
        "mi perfil",
        "mis datos",
        "datos personales",
        "informacion de mi cuenta",
        "mi informacion",
      ])
    ) {
      return {
        texto: `Puedes revisar la información de tu cuenta desde la sección Perfil, disponible en la navegación inferior de EsSalud Digital.`,
      };
    }

    // ¿QUÉ ES ESSALUD DIGITAL?

    if (
      contieneAlguna(consulta, [
        "que es essalud digital",
        "que es esta aplicacion",
        "que es la aplicacion",
        "para que sirve essalud digital",
        "que significa essalud digital",
      ])
    ) {
      return {
        texto: `EsSalud Digital es una plataforma que busca facilitar el acceso a los servicios de salud mediante herramientas digitales.

Su objetivo es permitir que los asegurados puedan realizar consultas y gestionar diferentes servicios desde un mismo espacio.

A través de la aplicación puedes acceder a citas médicas, recetas, exámenes y centros de atención. 💙`,
      };
    }

    // FUNCIONES Y SERVICIOS

    if (
      contieneAlguna(consulta, [
        "que puedo hacer",
        "que servicios ofrece",
        "que servicios tiene",
        "funciones de la aplicacion",
        "para que sirve",
        "que puedo consultar",
        "que opciones hay",
      ])
    ) {
      return {
        texto: `Desde EsSalud Digital puedes acceder a diferentes servicios:

📅 Reservar y consultar citas médicas.

💊 Revisar tus recetas médicas.

🧪 Consultar tus exámenes y resultados disponibles.

📍 Buscar centros de atención.

👤 Consultar la información de tu cuenta.

¡Todo desde una misma plataforma! 💙`,
      };
    }

    // SALUDOS

    if (
      contieneAlguna(consulta, [
        "hola",
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "holi",
        "que tal",
      ]) &&
      consulta.length < 45
    ) {
      return {
        texto: `¡Hola nuevamente, ${nombreUsuario}! 😊

Me alegra saludarte.

Estoy aquí para orientarte sobre los servicios de EsSalud Digital.

¿Qué te gustaría consultar hoy?`,
      };
    }

    // AGRADECIMIENTOS

    if (contieneAlguna(consulta, ["gracias", "te agradezco", "muy amable"])) {
      return {
        texto: `¡Con mucho gusto, ${nombreUsuario}! 💙

Me alegra haberte ayudado. Recuerda que puedes consultarme cuando lo necesites.`,
      };
    }

    // AYUDA

    if (
      contieneAlguna(consulta, [
        "ayuda",
        "como funciona",
        "como utilizar",
        "como uso",
        "como puedo usar",
        "necesito orientacion",
      ])
    ) {
      return {
        texto: `¡Claro que sí! 😊

Puedo orientarte sobre los principales servicios de EsSalud Digital.

Puedes preguntarme, por ejemplo:

• ¿Cómo puedo reservar una cita?
• ¿Dónde puedo consultar mis citas?
• ¿Cómo reviso mis recetas?
• ¿Dónde veo mis resultados de exámenes?
• ¿Cómo encuentro un centro de atención?
• ¿Qué servicios ofrece EsSalud Digital?

También puedo dirigirte directamente a cada sección.`,
      };
    }

    // RESPUESTA POR DEFECTO

    return {
      texto: `¡Gracias por escribirme, ${nombreUsuario}! 💙

Por el momento no tengo información suficiente para responder esa consulta.

Sin embargo, puedo orientarte sobre:

• Reserva de citas médicas.
• Consulta de citas programadas.
• Recetas y medicamentos.
• Exámenes médicos.
• Centros de atención.
• Funciones de EsSalud Digital.

¿Sobre cuál de estos servicios te gustaría saber más?`,
    };
  };

  // =========================================
  // NAVEGACIÓN SEGURA
  // =========================================

  const navegarA = (ruta) => {
    if (typeof ruta === "string" && ruta.startsWith("/essalud/")) {
      navigate(ruta);
    } else {
      console.error("Ruta de navegación no válida:", ruta);
    }
  };

  // =========================================
  // ENVIAR MENSAJES
  // =========================================

  const enviarMensaje = (texto = mensaje) => {
    const textoLimpio = texto.trim();

    // Permitir enviar texto o archivo.
    if ((!textoLimpio && !archivoAdjunto) || respondiendo) return;

    if (respuestaPendiente.current) {
      window.clearTimeout(respuestaPendiente.current);
    }

    const nuevoMensaje = {
      id: Date.now(),
      tipo: "usuario",
      texto: textoLimpio,
      archivo: archivoAdjunto,
      hora: obtenerHora(),
    };

    setMensajes((anteriores) => [...anteriores, nuevoMensaje]);

    setMensaje("");
    setArchivoAdjunto(null);
    setMostrarAdjuntos(false);

    // Si solamente se adjunta un archivo, no genera una respuesta
    // automática basada en texto.
    if (!textoLimpio) return;

    setRespondiendo(true);

    respuestaPendiente.current = window.setTimeout(() => {
      const respuesta = generarRespuesta(textoLimpio);

      const nuevoMensajeAsistente = {
        id: Date.now() + 1,
        tipo: "asistente",
        texto: respuesta.texto,
        accion: respuesta.accion || null,
        hora: obtenerHora(),
      };

      setMensajes((anteriores) => [...anteriores, nuevoMensajeAsistente]);

      setRespondiendo(false);
      respuestaPendiente.current = null;
    }, 900);
  };

  // =========================================
  // ACCESOS RÁPIDOS
  // =========================================

  const manejarAccesoRapido = (accion) => {
    const rutas = {
      citas: RUTAS.reservarCita,
      recetas: RUTAS.recetas,
      examenes: RUTAS.examenes,
    };

    navegarA(rutas[accion]);
  };

  // =========================================
  // ICONOS DE ACCIONES
  // =========================================

  const obtenerIconoAccion = (tipo) => {
    switch (tipo) {
      case "cita":
        return <CalendarDays size={18} />;

      case "receta":
        return <FileText size={18} />;

      case "examen":
        return <FlaskConical size={18} />;

      case "centro":
        return <MapPin size={18} />;

      default:
        return <ArrowRight size={18} />;
    }
  };

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <main className="appointments-screen chat-page">
      {/* ENCABEZADO */}

      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navegarA(RUTAS.inicio)}
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Chat</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          type="button"
          className="reservar-help"
          aria-label="Ayuda"
          onClick={() =>
            window.alert(
              "Puedes consultar sobre citas médicas, recetas, exámenes y centros de atención.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO DEL CHAT */}

      <section className="chat-content">
        {/* PERFIL DEL ASISTENTE */}

        <div className="chat-assistant-header">
          <div className="chat-assistant-avatar">
            <img
              src={asistenteSalud}
              alt="Asistente virtual de salud"
              className="chat-assistant-image"
            />
          </div>

          <div className="chat-assistant-info">
            <div className="chat-assistant-name">
              <h2>Asistente de salud</h2>

              <span
                className="chat-online-indicator"
                aria-label="Disponible"
                title="Disponible"
              />
            </div>

            <p>
              {respondiendo
                ? "Está preparando una respuesta..."
                : "Estoy aquí para ayudarte"}
            </p>
          </div>
        </div>

        {/* CONVERSACIÓN */}

        <div
          className="chat-messages"
          ref={mensajesRef}
          role="log"
          aria-label="Conversación con el asistente de salud"
          aria-live="polite"
        >
          {mensajes.map((item) => (
            <div
              key={item.id}
              className={`chat-message-row ${
                item.tipo === "usuario" ? "user-row" : "assistant-row"
              }`}
            >
              {item.tipo === "asistente" && (
                <div className="chat-small-avatar">
                  <img
                    src={asistenteSalud}
                    alt=""
                    className="chat-small-assistant-image"
                  />
                </div>
              )}

              <div className="chat-message-wrapper">
                <div className={`chat-bubble ${item.tipo}`}>
                  {item.texto}

                  {item.archivo && (
                    <div className="chat-message-attachment">
                      <FileText size={19} />
                      <span>{item.archivo.nombre}</span>
                    </div>
                  )}
                </div>

                {/* BOTÓN DE ACCIÓN DE LA RESPUESTA */}

                {item.tipo === "asistente" && item.accion && (
                  <button
                    type="button"
                    className="chat-response-action"
                    onClick={() => {
                      const ruta =
                        item.accion.texto === "Reservar mi cita"
                          ? RUTAS.reservarCita
                          : item.accion.ruta;

                      navegarA(ruta);
                    }}
                  >
                    {obtenerIconoAccion(item.accion.icono)}

                    <span>{item.accion.texto}</span>

                    <ArrowRight size={17} />
                  </button>
                )}

                <div className="chat-message-meta">
                  <span>{item.hora}</span>

                  {item.tipo === "usuario" && (
                    <CheckCheck size={16} aria-label="Mensaje enviado" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* INDICADOR DE ESCRITURA */}

          {respondiendo && (
            <div className="chat-message-row assistant-row">
              <div className="chat-small-avatar">
                <img
                  src={asistenteSalud}
                  alt=""
                  className="chat-small-assistant-image"
                />
              </div>

              <div
                className="chat-typing"
                aria-label="El asistente está escribiendo"
              >
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* ACCESOS RÁPIDOS */}

        <div className="chat-quick-actions">
          <button
            type="button"
            className="chat-quick-action"
            onClick={() => manejarAccesoRapido("citas")}
          >
            <CalendarDays size={23} />
            <span>Reservar cita</span>
          </button>

          <button
            type="button"
            className="chat-quick-action"
            onClick={() => manejarAccesoRapido("recetas")}
          >
            <FileText size={23} />
            <span>Ver mis recetas</span>
          </button>

          <button
            type="button"
            className="chat-quick-action"
            onClick={() => manejarAccesoRapido("examenes")}
          >
            <FlaskConical size={23} />
            <span>Consultar exámenes</span>
          </button>
        </div>

        {/* AVISO DE PRIVACIDAD */}

        <div className="chat-privacy-notice">
          <ShieldCheck size={23} />
          <span>No compartas datos personales sensibles.</span>
        </div>

        {/* CAMPO PARA ESCRIBIR */}

        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            enviarMensaje();
          }}
        >
          {/* MENÚ DE ADJUNTOS */}

          {mostrarAdjuntos && (
            <div className="chat-attachment-menu">
              <div className="chat-attachment-header">
                <strong>Adjuntar a la conversación</strong>

                <button
                  type="button"
                  onClick={() => setMostrarAdjuntos(false)}
                  aria-label="Cerrar menú"
                >
                  <X size={17} />
                </button>
              </div>

              <button
                type="button"
                className="chat-attachment-option"
                onClick={() => documentoRef.current?.click()}
              >
                <span className="attachment-option-icon document">
                  <FileText size={21} />
                </span>

                <span>
                  <strong>Documento</strong>
                  <small>PDF, Word o Excel</small>
                </span>
              </button>

              <button
                type="button"
                className="chat-attachment-option"
                onClick={() => galeriaRef.current?.click()}
              >
                <span className="attachment-option-icon gallery">
                  <ImageIcon size={21} />
                </span>

                <span>
                  <strong>Fotos o videos</strong>
                  <small>Desde tu galería</small>
                </span>
              </button>

              <button
                type="button"
                className="chat-attachment-option"
                onClick={() => camaraRef.current?.click()}
              >
                <span className="attachment-option-icon camera">
                  <Camera size={21} />
                </span>

                <span>
                  <strong>Cámara</strong>
                  <small>Tomar una foto o video</small>
                </span>
              </button>
            </div>
          )}

          {/* SELECTORES OCULTOS */}

          <input
            ref={documentoRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            hidden
            onChange={(event) => seleccionarArchivo(event, "documento")}
          />

          <input
            ref={galeriaRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={(event) => seleccionarArchivo(event, "multimedia")}
          />

          <input
            ref={camaraRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            hidden
            onChange={(event) => seleccionarArchivo(event, "multimedia")}
          />

          {/* ARCHIVO SELECCIONADO */}

          {archivoAdjunto && (
            <div className="chat-selected-file">
              <FileText size={19} />

              <span>{archivoAdjunto.nombre}</span>

              <button
                type="button"
                onClick={eliminarAdjunto}
                aria-label="Eliminar archivo adjunto"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* BOTÓN CLIP */}

          <button
            type="button"
            className="chat-attach-button"
            aria-label="Adjuntar archivo"
            aria-expanded={mostrarAdjuntos}
            onClick={manejarAdjunto}
          >
            <Paperclip size={24} />
          </button>

          {/* CAMPO DE TEXTO */}

          <input
            type="text"
            value={mensaje}
            onChange={(event) => setMensaje(event.target.value)}
            placeholder="Escribe tu mensaje..."
            aria-label="Escribe tu mensaje"
            autoComplete="off"
          />

          {/* BOTÓN DE MICRÓFONO */}
          <button
            type="button"
            className={`chat-mic-button ${grabando ? "recording" : ""}`}
            onClick={grabando ? detenerGrabacion : iniciarGrabacion}
            aria-label={grabando ? "Detener grabación" : "Grabar mensaje"}
            title={grabando ? "Detener grabación" : "Grabar mensaje"}
            disabled={respondiendo}
          >
            {grabando ? <Square size={19} /> : <Mic size={22} />}
          </button>

          {/* BOTÓN ENVIAR */}

          <button
            type="submit"
            className="chat-send-button"
            aria-label="Enviar mensaje"
            disabled={(!mensaje.trim() && !archivoAdjunto) || respondiendo}
          >
            <Send size={23} />
          </button>

          {errorMicrofono && (
            <p className="chat-mic-error" role="alert">
              {errorMicrofono}
            </p>
          )}
        </form>
      </section>

      {/* NAVEGACIÓN INFERIOR */}

      <BottomNavigation />
    </main>
  );
}
