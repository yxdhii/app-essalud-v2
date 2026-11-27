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
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  MoreHorizontal,
  Check,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import asistenteSalud from "../assets/asistente-salud.png";
import BottomNavigation from "../components/BottomNavigation";
import { obtenerUsuarioActivo } from "../services/usuariosService.js";
import { buscarRespuestaReceta } from "../services/generarRespuesta.js";
import { analizarDocumento } from "../services/analizarDocumento.js";
import { conocimientoRecetas } from "../data/conocimientoRecetas.js";
import { reproducirAudio, detenerAudio } from "../services/reproducirAudio.js";

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
  const [mensajeEnAudio, setMensajeEnAudio] = useState(null);
  const [mensajeCopiadoId, setMensajeCopiadoId] = useState(null);
  const [menuVozAbierto, setMenuVozAbierto] = useState(null);

  const [vozSeleccionada, setVozSeleccionada] = useState(
    () => localStorage.getItem("essalud_voz_asistente") || "Google español",
  );

  const [mostrarAdjuntos, setMostrarAdjuntos] = useState(false);
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [documentoContexto, setDocumentoContexto] = useState(null);

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

    if (tipo === "documento") {
      if (!archivo.name.toLowerCase().endsWith(".pdf")) {
        window.alert("Por ahora solo puedes adjuntar archivos PDF.");
        event.target.value = "";
        return;
      }

      if (archivo.type !== "application/pdf") {
        window.alert("El documento seleccionado no es un PDF válido.");
        event.target.value = "";
        return;
      }

      setArchivoAdjunto({
        nombre: archivo.name,
        tipo: archivo.type,
        tamanio: archivo.size,
        archivoOriginal: archivo,
      });
    }

    if (tipo === "multimedia") {
      if (
        !archivo.type.startsWith("image/") &&
        !archivo.type.startsWith("video/")
      ) {
        window.alert("Selecciona una imagen o un video válido.");
        event.target.value = "";
        return;
      }

      setArchivoAdjunto({
        nombre: archivo.name,
        tipo: archivo.type,
        tamanio: archivo.size,
        archivoOriginal: archivo,
      });
    }

    setMostrarAdjuntos(false);
    event.target.value = "";
  };

  const eliminarAdjunto = () => {
    setArchivoAdjunto(null);
  };

  // =========================================
  // BASE DE CONOCIMIENTO: PREGUNTAS Y RESPUESTAS DEL DOCUMENTO
  // =========================================

  const preguntasFrecuentes = [
    {
      pregunta: "¿Cómo puedo reservar una cita?",
      respuesta:
        "Ingresa a «Reservar cita», selecciona el tipo de atención, la especialidad, el médico y el horario disponible. Finalmente, revisa los datos y confirma tu reserva.",
    },
    {
      pregunta: "¿Dónde puedo ver mis citas?",
      respuesta:
        "Ingresa a «Mis citas» desde la barra inferior de navegación. Allí podrás consultar tus citas registradas y sus respectivos estados.",
    },
    {
      pregunta: "¿Cómo puedo cancelar una cita médica?",
      respuesta:
        "Ingresa a «Mis citas», selecciona la cita que deseas cancelar y presiona «Cancelar cita». Revisa la información y confirma tu decisión.",
    },
    {
      pregunta: "¿Qué hago si no encuentro citas disponibles?",
      respuesta:
        "Puedes consultar otras fechas o profesionales disponibles, según las opciones que te muestre el sistema. También puedes comunicarte con tu establecimiento de salud.",
    },
    {
      pregunta: "¿Cómo sé si mi cita fue reservada correctamente?",
      respuesta:
        "Al finalizar el proceso, aparecerá un mensaje de confirmación con los datos de tu cita. También podrás verificarla en «Mis citas».",
    },
    {
      pregunta: "¿Cómo puedo cambiar la fecha de mi cita?",
      respuesta:
        "Ingresa a «Mis citas» y revisa las opciones disponibles. Si no existe una opción de reprogramación, consulta la disponibilidad de una nueva cita antes de cancelar la actual.",
    },
    {
      pregunta: "¿Cómo busco una especialidad médica?",
      respuesta:
        "Ingresa a «Reservar cita» y utiliza el buscador de especialidades para encontrar la atención que necesitas.",
    },
    {
      pregunta: "¿Dónde puedo consultar la fecha y hora de mi cita?",
      respuesta:
        "Ingresa a «Mis citas» y selecciona la cita correspondiente para visualizar sus detalles.",
    },
    {
      pregunta: "¿Cómo sé qué médico me atenderá?",
      respuesta:
        "Puedes consultar el nombre del médico en el detalle de tu cita reservada.",
    },
    {
      pregunta: "¿Puedo elegir al médico que me atenderá?",
      respuesta:
        "Durante el proceso de reserva podrás seleccionar un médico entre los profesionales disponibles para la especialidad elegida.",
    },
    {
      pregunta: "¿Qué significa que mi cita está pendiente?",
      respuesta:
        "Significa que tu cita se encuentra registrada, pero todavía está pendiente de atención o programación, según el estado indicado.",
    },
    {
      pregunta: "¿Qué significa que mi cita está atendida?",
      respuesta: "Significa que tu cita figura como realizada en el sistema.",
    },
    {
      pregunta: "¿Qué significa que mi cita está cancelada?",
      respuesta:
        "Significa que la cita ya no se encuentra programada y no podrás recibir atención mediante esa reserva.",
    },
    {
      pregunta: "¿Dónde me atiendo?",
      respuesta:
        "Puedes consultar el establecimiento de salud que te corresponde ingresando al servicio oficial de EsSalud «¿Dónde me atiendo?», disponible en https://dondemeatiendo.essalud.gob.pe/.",
    },
    {
      pregunta: "¿Cómo puedo atenderme en EsSalud?",
      respuesta:
        "Verifica que tu seguro se encuentre activo, identifica el establecimiento de salud que te corresponde y solicita una cita médica según tus necesidades.",
    },
    {
      pregunta: "¿Cómo sé si mi seguro está activo?",
      respuesta:
        "Ingresa al servicio oficial «¿Dónde me atiendo?» de EsSalud y completa los datos solicitados para consultar tu acreditación.",
    },
    {
      pregunta: "¿Qué documentos necesito para atenderme?",
      respuesta:
        "Debes presentar tu documento de identidad y los documentos adicionales que correspondan al tipo de atención solicitada.",
    },
    {
      pregunta: "¿Puedo atenderme en cualquier hospital de EsSalud?",
      respuesta:
        "Para consultas programadas, normalmente debes acudir al establecimiento de salud asignado o contar con una derivación médica, según corresponda.",
    },
    {
      pregunta: "¿Cómo puedo saber cuál es mi centro de salud asignado?",
      respuesta:
        "Puedes consultar esta información mediante el servicio oficial «¿Dónde me atiendo?» de EsSalud.",
    },
    {
      pregunta: "¿Qué hago si necesito atenderme en otro hospital?",
      respuesta:
        "Comunícate con tu establecimiento de salud para consultar las opciones disponibles o solicitar orientación sobre una derivación médica.",
    },
    {
      pregunta: "¿Dónde queda el centro de salud en el que tengo mi cita?",
      respuesta:
        "Revisa el detalle de tu cita para identificar el establecimiento asignado. Puedes consultar su dirección mediante los canales oficiales de EsSalud.",
    },
    {
      pregunta: "¿Cómo sé en qué consultorio me atenderán?",
      respuesta:
        "Revisa los detalles de tu cita médica. Si el número de consultorio no aparece, consulta con el personal de admisión del establecimiento.",
    },
    {
      pregunta: "¿Qué hago si llego tarde a mi cita?",
      respuesta:
        "Comunícate con el establecimiento de salud para consultar si todavía puedes recibir atención o si necesitas solicitar una nueva cita.",
    },
    {
      pregunta: "¿Con cuánto tiempo de anticipación debo llegar a mi cita?",
      respuesta:
        "Revisa las indicaciones de tu establecimiento de salud y procura llegar con anticipación para completar el registro correspondiente.",
    },
    {
      pregunta: "¿Qué hago si necesito atención médica urgente?",
      respuesta:
        "Si presentas una emergencia médica, acude inmediatamente al servicio de emergencias más cercano. No esperes a reservar una cita mediante la aplicación.",
    },
    {
      pregunta: "¿Puedo atenderme si no tengo una cita reservada?",
      respuesta:
        "Dependerá del tipo de atención que necesites y de las condiciones del establecimiento. Comunícate con tu centro de salud para recibir orientación.",
    },
    {
      pregunta: "¿Qué hago si mi seguro no aparece activo?",
      respuesta:
        "Comunícate con los canales oficiales de acreditación de EsSalud para verificar tu situación y conocer los pasos necesarios para regularizarla.",
    },
    {
      pregunta: "¿La atención médica virtual es igual a la presencial?",
      respuesta:
        "No. La atención virtual se realiza de manera remota, mientras que la presencial requiere acudir al establecimiento de salud. La modalidad dependerá del servicio disponible y de tus necesidades médicas.",
    },
    {
      pregunta: "¿Cómo agrego a mi hijo?",
      respuesta:
        "Ingresa a «Mis perfiles», selecciona «Agregar familiar» y completa los datos solicitados.",
    },
    {
      pregunta: "¿Cómo puedo agregar a un familiar?",
      respuesta:
        "Accede a la sección «Mis familiares», selecciona «Agregar familiar» e ingresa la información requerida para vincularlo.",
    },
    {
      pregunta: "¿Dónde puedo ver a mis familiares registrados?",
      respuesta:
        "Ingresa a «Mis perfiles» para consultar los familiares vinculados a tu cuenta.",
    },
    {
      pregunta: "¿Cómo puedo reservar una cita para mi hijo?",
      respuesta:
        "Selecciona el perfil de tu hijo previamente vinculado, ingresa a «Reservar cita» y continúa con el proceso de reserva.",
    },
    {
      pregunta: "¿Puedo reservar una cita para mi madre?",
      respuesta:
        "Puedes gestionar una cita para tu madre si su perfil se encuentra vinculado a tu cuenta y cuentas con la autorización correspondiente.",
    },
    {
      pregunta:
        "¿Tengo que cerrar sesión para consultar las citas de otro familiar?",
      respuesta:
        "No. Puedes seleccionar el perfil familiar vinculado desde tu cuenta sin necesidad de cerrar sesión.",
    },
    {
      pregunta: "¿Cómo puedo consultar las recetas de mi familiar?",
      respuesta:
        "Selecciona el perfil correspondiente e ingresa a la sección «Recetas» para consultar la información disponible.",
    },
    {
      pregunta: "¿Puedo agregar a más de un familiar?",
      respuesta:
        "Sí. La propuesta permite administrar varios perfiles familiares desde una misma cuenta, sujeto a la validación y autorización correspondientes.",
    },
    {
      pregunta: "¿Cómo regreso a mi perfil personal?",
      respuesta: "Ingresa a «Mis perfiles» y selecciona tu perfil de titular.",
    },
    {
      pregunta: "¿Por qué no puedo agregar a un familiar?",
      respuesta:
        "Verifica que los datos ingresados sean correctos. Si el problema continúa, consulta con los canales de soporte de EsSalud.",
    },
    {
      pregunta: "¿Dónde encuentro mis recetas médicas?",
      respuesta:
        "Ingresa al módulo «Recetas» desde la pantalla principal. Allí podrás consultar tus recetas registradas.",
    },
    {
      pregunta: "¿Cómo puedo descargar mi receta médica?",
      respuesta:
        "Selecciona la receta que deseas consultar y presiona la opción de descarga disponible.",
    },
    {
      pregunta: "¿Cómo puedo saber qué medicamentos me recetaron?",
      respuesta:
        "Ingresa al detalle de tu receta médica para consultar los medicamentos e indicaciones registrados por tu médico.",
    },
    {
      pregunta: "¿Dónde puedo recoger mis medicamentos?",
      respuesta:
        "Consulta las indicaciones de tu receta o comunícate con la farmacia del establecimiento donde recibiste atención.",
    },
    {
      pregunta: "¿Qué significa que mi receta está emitida?",
      respuesta:
        "Significa que tu receta médica ha sido generada y registrada en el sistema.",
    },
    {
      pregunta: "¿Por qué no aparece mi receta médica?",
      respuesta:
        "Verifica que estés consultando el perfil correcto. Si la receta no aparece, comunícate con el establecimiento donde recibiste atención.",
    },
    {
      pregunta: "¿Puedo consultar mis recetas anteriores?",
      respuesta:
        "Sí. Ingresa a la sección «Recetas» para consultar los registros disponibles.",
    },
    {
      pregunta: "¿Qué hago si no encuentro un medicamento en farmacia?",
      respuesta:
        "Consulta con el personal de farmacia de tu establecimiento de salud para conocer las alternativas disponibles.",
    },
    {
      pregunta: "¿Puedo cambiar la dosis de un medicamento?",
      respuesta:
        "No debes modificar la dosis de tus medicamentos sin consultar previamente con tu médico tratante.",
    },
    {
      pregunta: "¿Puedes recomendarme algún medicamento?",
      respuesta:
        "No puedo recomendar medicamentos ni tratamientos. Te sugiero consultar con un profesional de salud para recibir una orientación adecuada.",
    },
    {
      pregunta: "¿Dónde puedo consultar mis exámenes médicos?",
      respuesta:
        "Ingresa a la sección correspondiente a exámenes médicos, si se encuentra disponible en tu cuenta, para revisar tus registros.",
    },
    {
      pregunta: "¿Cómo sé si mis resultados están disponibles?",
      respuesta:
        "Consulta el estado de tus exámenes en la aplicación o comunícate con el establecimiento donde fueron realizados.",
    },
    {
      pregunta: "¿Por qué todavía no aparecen mis resultados?",
      respuesta:
        "Es posible que los resultados se encuentren pendientes de procesamiento o registro. Consulta con tu establecimiento de salud.",
    },
    {
      pregunta: "¿Dónde puedo realizarme un examen de laboratorio?",
      respuesta:
        "Revisa las indicaciones de la orden médica proporcionada por tu médico para identificar el establecimiento o servicio correspondiente.",
    },
    {
      pregunta: "¿Qué documentos necesito para realizarme un examen?",
      respuesta:
        "Debes presentar tu documento de identidad y la orden médica correspondiente. Recuerda seguir las indicaciones de preparación proporcionadas por el personal de salud.",
    },
    {
      pregunta: "¿Puedes interpretar los resultados de mis exámenes?",
      respuesta:
        "No puedo realizar interpretaciones clínicas ni diagnósticos médicos. Te recomiendo consultar los resultados con tu médico tratante.",
    },
    {
      pregunta: "¿Qué especialidades médicas están disponibles?",
      respuesta:
        "Ingresa a «Reservar cita» para consultar las especialidades que se encuentran habilitadas en el sistema.",
    },
    {
      pregunta: "¿Cómo puedo reservar una cita en Medicina General?",
      respuesta:
        "Ingresa a «Reservar cita», busca Medicina General y selecciona un médico, una fecha y un horario disponibles.",
    },
    {
      pregunta: "¿Cómo puedo reservar una cita en Pediatría?",
      respuesta:
        "Selecciona el perfil del menor que requiere atención, ingresa a «Reservar cita» y busca la especialidad de Pediatría.",
    },
    {
      pregunta: "¿Cómo puedo reservar una cita en Odontología?",
      respuesta:
        "Ingresa al módulo de reservas y busca la especialidad de Odontología. Después, selecciona una opción disponible.",
    },
    {
      pregunta: "¿Cómo puedo reservar una cita en Psicología?",
      respuesta:
        "Ingresa a «Reservar cita» y consulta si la especialidad de Psicología se encuentra disponible.",
    },
    {
      pregunta: "¿Qué hago si no sé qué especialidad elegir?",
      respuesta:
        "Puedes solicitar orientación a un profesional de salud. Para consultas no urgentes, Medicina General puede ser un punto de partida.",
    },
    {
      pregunta: "¿Puedo solicitar atención directamente con un especialista?",
      respuesta:
        "Dependerá de las condiciones de atención de tu establecimiento y de si necesitas una derivación médica previa.",
    },
    {
      pregunta: "¿Qué es una derivación médica?",
      respuesta:
        "Es una indicación realizada por un profesional de salud para que recibas atención en otro servicio o establecimiento, según tus necesidades médicas.",
    },
    {
      pregunta: "¿Cómo puedo aumentar el tamaño del texto?",
      respuesta:
        "Ingresa a «Mi perfil», busca el apartado «Accesibilidad e inclusión» y selecciona el tamaño de texto grande.",
    },
    {
      pregunta: "¿Cómo puedo disminuir el tamaño de las letras?",
      respuesta:
        "Ingresa a «Accesibilidad e inclusión» y selecciona el tamaño de texto pequeño o mediano.",
    },
    {
      pregunta: "¿Cómo puedo activar el modo oscuro?",
      respuesta:
        "Ingresa a «Mi perfil», busca «Tema de visualización» y selecciona el icono de luna.",
    },
    {
      pregunta: "¿Cómo regreso al modo claro?",
      respuesta:
        "Ingresa a «Tema de visualización» y selecciona el icono de sol.",
    },
    {
      pregunta: "¿Cómo puedo activar el contraste alto?",
      respuesta:
        "Accede a «Mi perfil», ingresa a «Accesibilidad e inclusión» y selecciona la opción de contraste alto.",
    },
    {
      pregunta: "¿Cómo puedo regresar al contraste normal?",
      respuesta:
        "Ingresa al módulo de accesibilidad y selecciona la opción de contraste normal.",
    },
    {
      pregunta: "¿Cómo puedo escuchar el contenido de la aplicación?",
      respuesta:
        "Ingresa a «Mi perfil» y activa la opción «Lectura en voz alta». Después, selecciona el botón flotante de altavoz para solicitar la lectura del contenido.",
    },
    {
      pregunta: "¿Cómo desactivo la lectura en voz alta?",
      respuesta:
        "Regresa al apartado «Accesibilidad e inclusión» y desactiva el interruptor de lectura en voz alta.",
    },
    {
      pregunta: "¿Puedo controlar la aplicación mediante comandos de voz?",
      respuesta:
        "Actualmente, la propuesta cuenta con una opción de lectura en voz alta, pero no permite realizar operaciones mediante comandos hablados.",
    },
    {
      pregunta: "¿Cómo puedo desactivar el sonido de la aplicación?",
      respuesta:
        "Ingresa a «Mi perfil», busca «Accesibilidad e inclusión» y desactiva la opción «Sonido de la aplicación».",
    },
    {
      pregunta: "¿Dónde encuentro las opciones de accesibilidad?",
      respuesta:
        "Puedes encontrarlas dentro de «Mi perfil», en el apartado «Accesibilidad e inclusión».",
    },
    {
      pregunta: "¿Puedo utilizar la aplicación sin sonido?",
      respuesta:
        "Sí. La aplicación presenta mensajes escritos, iconos y confirmaciones visuales para facilitar la comprensión de las operaciones.",
    },
    {
      pregunta: "¿Puedo personalizar la aplicación según mis necesidades?",
      respuesta:
        "Sí. Puedes modificar el tamaño del texto, el contraste, el tema de visualización y las opciones de sonido y lectura en voz alta.",
    },
    {
      pregunta: "¿Cómo puedo iniciar sesión?",
      respuesta:
        "Ingresa tus credenciales en la pantalla de acceso y selecciona la opción para iniciar sesión.",
    },
    {
      pregunta: "¿Cómo puedo cambiar mi contraseña?",
      respuesta:
        "¡Claro! 😊 Para cambiar tu contraseña, sigue estos pasos:\n\n1. Ingresa a Perfil.\n2. Selecciona Seguridad de mi cuenta.\n3. Pulsa Cambiar contraseña.\n4. Completa los campos solicitados y guarda los cambios.\n\n¡Así podrás actualizar tu contraseña de manera sencilla y segura!",
    },
    {
      pregunta: "¿Dónde puedo consultar mis datos personales?",
      respuesta:
        "Ingresa a «Mi perfil» para consultar la información asociada a tu cuenta.",
    },
    {
      pregunta: "¿Cómo puedo actualizar mi número de celular?",
      respuesta:
        "Revisa las opciones disponibles dentro de «Mi perfil». Si no puedes modificarlo, comunícate con los canales oficiales de EsSalud.",
    },
    {
      pregunta: "¿Cómo puedo actualizar mi correo electrónico?",
      respuesta:
        "Ingresa a tu perfil y revisa si se encuentra habilitada la opción de actualización de datos.",
    },
    {
      pregunta: "¿Cómo puedo cerrar sesión?",
      respuesta: "Ingresa al menú de tu cuenta y selecciona «Cerrar sesión».",
    },
    {
      pregunta: "¿Qué hago si no puedo iniciar sesión?",
      respuesta:
        "Verifica que tus credenciales sean correctas y que tengas conexión a Internet. Si el problema continúa, comunícate con soporte.",
    },
    {
      pregunta: "¿Puedo compartir mi contraseña contigo?",
      respuesta:
        "No. Por tu seguridad, nunca debes compartir contraseñas, códigos de verificación ni credenciales personales mediante el Chat.",
    },
    {
      pregunta: "¿Puedes acceder a mi historia clínica?",
      respuesta:
        "No tengo acceso a tu historia clínica. Mi función es orientarte sobre el uso de la aplicación y los servicios de EsSalud.",
    },
    {
      pregunta: "¿Qué puedo hacer en EsSalud Digital?",
      respuesta:
        "Puedes reservar citas médicas, consultar tus citas, gestionar perfiles familiares, revisar recetas y personalizar las opciones de accesibilidad.",
    },
    {
      pregunta: "¿Cómo regreso a la pantalla principal?",
      respuesta: "Selecciona «Inicio» en la barra inferior de navegación.",
    },
    {
      pregunta: "¿Cómo puedo encontrar un servicio dentro de la aplicación?",
      respuesta:
        "Utiliza el buscador disponible en la pantalla principal y escribe el nombre del servicio que necesitas.",
    },
    {
      pregunta: "¿Dónde encuentro el menú principal?",
      respuesta:
        "Selecciona el icono de menú ubicado en la parte superior de la pantalla.",
    },
    {
      pregunta: "¿Dónde encuentro la opción para reservar una cita?",
      respuesta:
        "Ingresa a la pantalla de inicio y selecciona «Reservar cita».",
    },
    {
      pregunta: "¿Dónde puedo encontrar ayuda para utilizar la aplicación?",
      respuesta:
        "Puedes ingresar al módulo «Chat» desde la barra inferior de navegación y realizar tus consultas al asistente virtual.",
    },
    {
      pregunta: "¿Puedo utilizar la aplicación sin conexión a Internet?",
      respuesta:
        "Las consultas y gestiones que necesitan comunicarse con el sistema requieren una conexión a Internet.",
    },
    {
      pregunta: "¿La aplicación tiene algún costo por reservar una cita?",
      respuesta:
        "La reserva mediante la aplicación no debe confundirse con un servicio privado de pago. Las condiciones de atención dependen de tu cobertura y acreditación en EsSalud.",
    },
    {
      pregunta: "¿Qué hago si la aplicación no carga?",
      respuesta:
        "Verifica tu conexión a Internet, intenta actualizar la pantalla o ingresa nuevamente a la aplicación.",
    },
    {
      pregunta: "¿Qué hago si aparece un mensaje de error?",
      respuesta:
        "Lee las indicaciones del mensaje y sigue las alternativas disponibles. Si el problema continúa, comunícate con soporte.",
    },
    {
      pregunta: "¿Qué hago si la aplicación se cierra inesperadamente?",
      respuesta:
        "Intenta abrirla nuevamente y verifica tu conexión a Internet. Si el problema persiste, comunícate con soporte técnico.",
    },
    {
      pregunta: "¿Qué hago si no puedo descargar mi receta?",
      respuesta:
        "Verifica tu conexión a Internet y los permisos de descarga del dispositivo. Si el problema continúa, consulta con tu establecimiento de salud.",
    },
    {
      pregunta: "¿Cómo puedo presentar una queja o reclamo?",
      respuesta:
        "Puedes consultar los canales oficiales de atención al asegurado y reclamos disponibles en el portal institucional de EsSalud.",
    },
    {
      pregunta: "¿Cómo puedo comunicarme con EsSalud?",
      respuesta:
        "Puedes consultar los números telefónicos y canales de atención correspondientes a tu región en el portal oficial https://www.essalud.gob.pe/.",
    },
    {
      pregunta: "¿Qué hago si el asistente no puede resolver mi consulta?",
      respuesta:
        "Puedes intentar formular tu pregunta de otra manera o comunicarte con los canales oficiales de atención de EsSalud.",
    },
    {
      pregunta: "Hola.",
      respuesta:
        "¡Hola! Bienvenido a EsSalud Digital. Soy tu asistente virtual y estoy aquí para ayudarte con tus citas médicas, recetas, familiares y consultas sobre los servicios de EsSalud. ¿En qué puedo ayudarte hoy?",
    },
    {
      pregunta: "¿Quién eres?",
      respuesta:
        "Soy el asistente virtual de EsSalud Digital. Mi función es orientarte y facilitar el uso de las funcionalidades de la aplicación.",
    },
    {
      pregunta: "¿En qué puedes ayudarme?",
      respuesta:
        "Puedo ayudarte a conocer cómo reservar citas, consultar recetas, administrar familiares, localizar información sobre tu atención y utilizar las opciones de accesibilidad.",
    },
    {
      pregunta: "Necesito ayuda.",
      respuesta:
        "¡Claro! Estoy aquí para ayudarte. Cuéntame si necesitas orientación sobre citas médicas, recetas, familiares, centros de salud o el funcionamiento de la aplicación.",
    },
    {
      pregunta: "¿Eres un médico?",
      respuesta:
        "No. Soy un asistente virtual de orientación y no reemplazo la atención de un profesional de salud.",
    },
    {
      pregunta: "¿Puedes decirme qué enfermedad tengo?",
      respuesta:
        "No puedo realizar diagnósticos médicos. Te recomiendo solicitar una consulta con un profesional de salud para recibir una evaluación adecuada.",
    },
    {
      pregunta: "¿Puedes reservar una cita por mí?",
      respuesta:
        "Puedo orientarte durante el proceso de reserva, pero debes seleccionar y confirmar personalmente los datos de tu cita.",
    },
    {
      pregunta: "¿Puedes cancelar mi cita por mí?",
      respuesta:
        "Puedo explicarte cómo cancelar una cita, pero debes realizar y confirmar esta operación desde la sección «Mis citas».",
    },
    {
      pregunta:
        "Disculpa. Puedo explicártelo nuevamente utilizando palabras más sencillas. ¿Qué parte de la información necesitas comprender mejor?",
      respuesta: "Gracias por tu ayuda.",
    },
    {
      pregunta:
        "¡De nada! Estoy aquí para ayudarte cuando lo necesites. ¿Hay alguna otra consulta que quieras realizar?",
      respuesta: "Hasta luego.",
    },
  ];

  const obtenerAccionFAQ = (pregunta) => {
    const p = normalizarTexto(pregunta);

    if (
      p.includes("reservar una cita") ||
      p.includes("buscar una especialidad") ||
      p.includes("medicina general") ||
      p.includes("pediatria") ||
      p.includes("odontologia") ||
      p.includes("psicologia") ||
      p.includes("especialidades medicas")
    ) {
      return {
        texto: "Ir a Reservar cita",
        ruta: RUTAS.reservarCita,
        icono: "cita",
      };
    }

    if (
      p.includes("mis citas") ||
      p.includes("cancelar una cita") ||
      p.includes("cambiar la fecha") ||
      p.includes("fecha y hora de mi cita")
    ) {
      return { texto: "Ir a Mis citas", ruta: RUTAS.citas, icono: "cita" };
    }

    if (p.includes("receta") || p.includes("medicamento")) {
      return { texto: "Ver mis recetas", ruta: RUTAS.recetas, icono: "receta" };
    }

    if (p.includes("examen") || p.includes("resultado")) {
      return {
        texto: "Consultar exámenes",
        ruta: RUTAS.examenes,
        icono: "examen",
      };
    }

    if (
      p.includes("centro de salud") ||
      p.includes("donde me atiendo") ||
      p.includes("hospital") ||
      p.includes("establecimiento")
    ) {
      return {
        texto: "Ver centros de atención",
        ruta: RUTAS.centros,
        icono: "centro",
      };
    }

    if (
      p.includes("accesibilidad") ||
      p.includes("texto") ||
      p.includes("modo oscuro") ||
      p.includes("contraste") ||
      p.includes("lectura en voz alta") ||
      p.includes("sonido")
    ) {
      return { texto: "Ir a Mi perfil", ruta: RUTAS.perfil, icono: "perfil" };
    }

    if (
      p.includes("perfil") ||
      p.includes("familiar") ||
      p.includes("iniciar sesion") ||
      p.includes("contraseña") ||
      p.includes("datos personales") ||
      p.includes("cerrar sesion")
    ) {
      return { texto: "Ir a Mi perfil", ruta: RUTAS.perfil, icono: "perfil" };
    }

    if (
      p.includes("pantalla principal") ||
      p.includes("menu principal") ||
      p.includes("servicio dentro de la aplicacion")
    ) {
      return { texto: "Ir al inicio", ruta: RUTAS.inicio, icono: "inicio" };
    }

    return null;
  };

  const aliasPreguntas = [
    {
      contiene: [
        "quiero sacar cita",
        "sacar cita",
        "agendar cita",
        "pedir cita",
        "solicitar cita",
        "necesito una cita",
        "quiero una consulta",
      ],
      pregunta: "¿Cómo puedo reservar una cita?",
    },
    {
      contiene: [
        "ver mis citas",
        "mis proximas citas",
        "cuando tengo cita",
        "consultar mis reservas",
      ],
      pregunta: "¿Dónde puedo ver mis citas?",
    },
    {
      contiene: ["anular cita", "dar de baja mi cita"],
      pregunta: "¿Cómo puedo cancelar una cita médica?",
    },
    {
      contiene: [
        "no hay citas",
        "no encuentro horario",
        "no hay disponibilidad",
      ],
      pregunta: "¿Qué hago si no encuentro citas disponibles?",
    },
    {
      contiene: [
        "confirmar mi cita",
        "mi cita se registro",
        "se registro la reserva",
      ],
      pregunta: "¿Cómo sé si mi cita fue reservada correctamente?",
    },
    {
      contiene: ["reprogramar cita", "mover mi cita", "cambiar mi cita"],
      pregunta: "¿Cómo puedo cambiar la fecha de mi cita?",
    },
    {
      contiene: ["buscar especialidad", "que especialidades hay"],
      pregunta: "¿Cómo busco una especialidad médica?",
    },
    {
      contiene: ["quien me atendera", "nombre del doctor", "nombre del medico"],
      pregunta: "¿Cómo sé qué médico me atenderá?",
    },
    {
      contiene: ["puedo escoger medico", "elegir doctor"],
      pregunta: "¿Puedo elegir al médico que me atenderá?",
    },
    {
      contiene: [
        "seguro vigente",
        "vigencia de mi seguro",
        "mi seguro esta vigente",
      ],
      pregunta: "¿Cómo sé si mi seguro está activo?",
    },
    {
      contiene: ["mi centro asignado", "establecimiento que me corresponde"],
      pregunta: "¿Cómo puedo saber cuál es mi centro de salud asignado?",
    },
    {
      contiene: ["agregar hijo", "registrar a mi hijo"],
      pregunta: "¿Cómo agrego a mi hijo?",
    },
    {
      contiene: ["agregar familiar", "registrar familiar", "vincular familiar"],
      pregunta: "¿Cómo puedo agregar a un familiar?",
    },
    {
      contiene: ["cita para mi hijo", "cita de mi hijo"],
      pregunta: "¿Cómo puedo reservar una cita para mi hijo?",
    },
    {
      contiene: ["cita para mi mama", "cita para mi madre"],
      pregunta: "¿Puedo reservar una cita para mi madre?",
    },
    {
      contiene: ["ver receta", "mis medicamentos recetados"],
      pregunta: "¿Dónde encuentro mis recetas médicas?",
    },
    {
      contiene: ["bajar mi receta", "guardar receta"],
      pregunta: "¿Cómo puedo descargar mi receta médica?",
    },
    {
      contiene: ["medicinas que me recetaron", "que me receto el doctor"],
      pregunta: "¿Cómo puedo saber qué medicamentos me recetaron?",
    },
    {
      contiene: ["resultados de laboratorio", "analisis clinicos"],
      pregunta: "¿Dónde puedo consultar mis exámenes médicos?",
    },
    {
      contiene: ["leeme la pantalla", "leer en voz alta", "que la app me lea"],
      pregunta: "¿Cómo puedo escuchar el contenido de la aplicación?",
    },
    {
      contiene: ["letras mas grandes", "agrandar letras", "aumentar letra"],
      pregunta: "¿Cómo puedo aumentar el tamaño del texto?",
    },
    {
      contiene: ["letras mas pequeñas", "reducir letra", "disminuir letra"],
      pregunta: "¿Cómo puedo disminuir el tamaño de las letras?",
    },
    {
      contiene: ["pantalla negra", "tema oscuro", "fondo oscuro"],
      pregunta: "¿Cómo puedo activar el modo oscuro?",
    },
    {
      contiene: [
        "cambiar contraseña",
        "cambiar mi contraseña",
        "quiero cambiar mi contraseña",
        "actualizar contraseña",
        "modificar mi clave",
      ],
      pregunta: "¿Cómo puedo cambiar mi contraseña?",
    },
    {
      contiene: [
        "no puedo entrar",
        "no puedo acceder",
        "error al iniciar sesion",
      ],
      pregunta: "¿Qué hago si no puedo iniciar sesión?",
    },
    {
      contiene: ["no abre la aplicacion", "app no carga", "pantalla no carga"],
      pregunta: "¿Qué hago si la aplicación no carga?",
    },
    {
      contiene: ["presentar reclamo", "poner una queja"],
      pregunta: "¿Cómo puedo presentar una queja o reclamo?",
    },
    {
      contiene: ["eres doctor", "eres doctora", "eres medico"],
      pregunta: "¿Eres un médico?",
    },
    {
      contiene: [
        "diagnosticarme",
        "que enfermedad tengo",
        "saber que enfermedad tengo",
      ],
      pregunta: "¿Puedes decirme qué enfermedad tengo?",
    },
    {
      contiene: ["reservala por mi", "sacame una cita", "hazme una cita"],
      pregunta: "¿Puedes reservar una cita por mí?",
    },
    {
      contiene: ["cancelala por mi", "cancela mi cita tu"],
      pregunta: "¿Puedes cancelar mi cita por mí?",
    },
  ];

  const generarRespuesta = (texto) => {
    const consulta = normalizarTexto(texto);

    // =========================================
    // CONSULTAR BASE DE CONOCIMIENTO DE RECETAS
    // =========================================

    const respuestaReceta = buscarRespuestaReceta(texto);

    if (respuestaReceta) {
      return {
        texto: respuestaReceta,
        accion: null,
      };
    }

    // Primero se buscan coincidencias con las variantes de redacción habituales.
    const aliasEncontrado = aliasPreguntas.find((alias) =>
      alias.contiene.some((frase) => consulta.includes(normalizarTexto(frase))),
    );

    let coincidencia = null;

    if (aliasEncontrado) {
      const preguntaObjetivo = normalizarTexto(aliasEncontrado.pregunta);
      coincidencia = preguntasFrecuentes.find(
        (item) => normalizarTexto(item.pregunta) === preguntaObjetivo,
      );
    }

    // Después se compara con las preguntas originales del documento.
    if (!coincidencia) {
      coincidencia = preguntasFrecuentes.find((item) => {
        const pregunta = normalizarTexto(item.pregunta);
        return (
          consulta === pregunta ||
          (pregunta.length > 12 && consulta.includes(pregunta)) ||
          (consulta.length > 12 && pregunta.includes(consulta))
        );
      });
    }

    // Coincidencia por palabras relevantes para aceptar preguntas formuladas de otra manera.
    if (!coincidencia) {
      const palabrasIgnoradas = new Set([
        "como",
        "puedo",
        "puede",
        "puedes",
        "donde",
        "cuando",
        "para",
        "esta",
        "este",
        "tengo",
        "quiero",
        "hacer",
        "hacerlo",
        "que",
        "con",
        "una",
        "uno",
        "mis",
        "las",
        "los",
        "del",
        "por",
        "desde",
        "salud",
        "essalud",
        "digital",
      ]);

      let mejorPuntaje = 0;
      for (const item of preguntasFrecuentes) {
        const palabrasPregunta = normalizarTexto(item.pregunta)
          .split(" ")
          .filter(
            (palabra) => palabra.length > 3 && !palabrasIgnoradas.has(palabra),
          );
        const unicas = [...new Set(palabrasPregunta)];
        if (!unicas.length) continue;

        const coincidencias = unicas.filter((palabra) =>
          consulta.includes(palabra),
        ).length;
        const puntaje = coincidencias / unicas.length;

        if (coincidencias >= 2 && puntaje > mejorPuntaje && puntaje >= 0.45) {
          mejorPuntaje = puntaje;
          coincidencia = item;
        }
      }
    }

    if (coincidencia) {
      return {
        texto: coincidencia.respuesta,
        accion: obtenerAccionFAQ(coincidencia.pregunta),
      };
    }

    // Respuestas generales tomadas del apartado de interacción del documento.
    if (consulta === "hola" || consulta.startsWith("hola ")) {
      return {
        texto:
          "¡Hola! Bienvenido a EsSalud Digital. Soy tu asistente virtual y estoy aquí para ayudarte con tus citas médicas, recetas, familiares y consultas sobre los servicios de EsSalud. ¿En qué puedo ayudarte hoy?",
      };
    }

    if (consulta.includes("gracias")) {
      return {
        texto:
          "¡De nada! Estoy aquí para ayudarte cuando lo necesites. ¿Hay alguna otra consulta que quieras realizar?",
      };
    }

    return {
      texto: `¡Hola, ${nombreUsuario}! Puedo orientarte sobre las funcionalidades de EsSalud Digital.\n\nPuedes consultarme sobre:\n• Reserva y gestión de citas médicas.\n• Atención médica y centros de salud.\n• Gestión de familiares.\n• Recetas médicas y medicamentos.\n• Exámenes y resultados médicos.\n• Especialidades médicas.\n• Accesibilidad e inclusión.\n• Cuenta y seguridad.\n• Navegación y funcionalidades.\n• Problemas técnicos y soporte.\n\nIntenta formular tu consulta de otra manera para que pueda encontrar la respuesta más adecuada.`,
    };
  };

  const responderPreguntaDocumento = (pregunta, documento) => {
    if (!documento?.caso) return null;

    const consulta = normalizarTexto(pregunta);

    // Identificar el caso que se adjuntó.
    const idCaso = documento.caso.includes("01")
      ? "caso-01"
      : documento.caso.includes("02")
        ? "caso-02"
        : documento.caso.includes("05")
          ? "caso-05"
          : null;

    const receta = conocimientoRecetas.find((item) => item.id === idCaso);

    if (!receta) return null;

    // Consultar el diagnóstico.
    if (
      consulta.includes("diagnostico") ||
      consulta === "diagnostico" ||
      consulta.includes("que tengo")
    ) {
      return `Según la información de la receta que adjuntaste, el diagnóstico es ${receta.nombre}.\n\n${receta.diagnostico}\n\nEsta información corresponde al documento de ejemplo y no sustituye una evaluación médica.`;
    }

    // Consultar medicamentos.
    if (
      consulta.includes("medicamento") ||
      consulta.includes("medicinas") ||
      consulta.includes("que me recetaron")
    ) {
      return `Estos son los medicamentos que aparecen en la información de tu receta:\n\n${receta.medicamentos
        .map((medicamento) => `• ${medicamento.nombre}\n${medicamento.uso}`)
        .join("\n\n")}`;
    }

    // Consultar indicaciones.
    if (
      consulta.includes("indicacion") ||
      consulta.includes("dosis") ||
      consulta.includes("como tomar") ||
      consulta.includes("cada cuanto")
    ) {
      return receta.medicamentos
        .map(
          (medicamento) => `${medicamento.nombre}:\n${medicamento.indicacion}`,
        )
        .join("\n\n");
    }

    // Consultar precauciones.
    if (
      consulta.includes("precaucion") ||
      consulta.includes("cuidado con el medicamento")
    ) {
      return receta.medicamentos
        .map(
          (medicamento) =>
            `${medicamento.nombre}:\n${medicamento.precauciones}`,
        )
        .join("\n\n");
    }

    // Consultar recomendaciones.
    if (
      consulta.includes("recomendacion") ||
      consulta.includes("cuidados") ||
      consulta.includes("que debo hacer")
    ) {
      return `Las recomendaciones de tu receta son:\n\n${receta.cuidados
        .map((cuidado) => `• ${cuidado}`)
        .join("\n")}`;
    }

    // Consultar signos de alarma.
    if (
      consulta.includes("alarma") ||
      consulta.includes("emergencia") ||
      consulta.includes("signos de peligro")
    ) {
      return `Según la información de tu receta:\n\n${receta.alertas
        .map((alerta) => `• ${alerta}`)
        .join("\n\n")}`;
    }

    return "He identificado la receta que adjuntaste, pero no encuentro información suficiente para responder esa pregunta. Puedes consultarme sobre el diagnóstico, medicamentos, indicaciones, precauciones, recomendaciones o signos de alarma.";
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

  const enviarMensaje = async (texto = mensaje) => {
    const textoLimpio = texto.trim();

    if ((!textoLimpio && !archivoAdjunto) || respondiendo) return;

    if (respuestaPendiente.current) {
      window.clearTimeout(respuestaPendiente.current);
      respuestaPendiente.current = null;
    }

    // Conservar el archivo original para analizarlo,
    // pero guardar solo sus datos básicos en el historial.
    const archivoOriginal = archivoAdjunto?.archivoOriginal;

    const archivoHistorial = archivoAdjunto
      ? {
          nombre: archivoAdjunto.nombre,
          tipo: archivoAdjunto.tipo,
          tamanio: archivoAdjunto.tamanio,
        }
      : null;

    const nuevoMensaje = {
      id: Date.now(),
      tipo: "usuario",
      texto: textoLimpio,
      archivo: archivoHistorial,
      hora: obtenerHora(),
    };

    setMensajes((anteriores) => [...anteriores, nuevoMensaje]);

    setMensaje("");
    setArchivoAdjunto(null);
    setMostrarAdjuntos(false);

    // =========================================
    // ANALIZAR DOCUMENTO PDF
    // =========================================

    if (archivoOriginal?.type === "application/pdf") {
      setRespondiendo(true);

      try {
        const documento = await analizarDocumento(archivoOriginal);

        const contenido = normalizarTexto(documento.texto);

        // Identificar cuál de nuestras tres recetas se adjuntó.
        let casoIdentificado = null;

        if (
          contenido.includes("rinitis alergica") &&
          contenido.includes("loratadina")
        ) {
          casoIdentificado = "Caso académico 02: Rinitis alérgica";
        } else if (
          contenido.includes("gastritis") &&
          contenido.includes("omeprazol")
        ) {
          casoIdentificado =
            "Caso académico 05: Gastritis y reflujo gastroesofágico";
        } else if (
          contenido.includes("resfriado comun") &&
          contenido.includes("paracetamol")
        ) {
          casoIdentificado = "Caso académico 01: Resfriado común";
        }

        // Guardar el texto extraído temporalmente en memoria.
        setDocumentoContexto({
          nombre: documento.nombre,
          paginas: documento.paginas,
          texto: documento.texto,
          caso: casoIdentificado,
        });

        let respuestaTexto = "";

        if (casoIdentificado) {
          respuestaTexto =
            `¡He recibido tu documento! 😊\n\n` +
            `He podido leer el PDF: ${documento.nombre}\n\n` +
            `Identifiqué: ${casoIdentificado}.\n\n` +
            `Pude extraer el texto de ${documento.paginas} página(s).\n\n` +
            `Ahora puedes preguntarme sobre el diagnóstico, los medicamentos, las indicaciones, las recomendaciones o los signos de alarma que aparecen en esta receta.\n\n` +
            `Recuerda que este asistente ofrece información educativa y no reemplaza la orientación de un profesional de salud.`;
        } else {
          respuestaTexto =
            `He podido abrir el documento ${documento.nombre} y extraer su texto, pero no pude identificarlo como una de las tres recetas de prueba (casos 01, 02 o 05).\n\n` +
            `Por seguridad, no asumiré cuál es su contenido. Puedes verificar que hayas adjuntado una de nuestras recetas de prueba.`;
        }

        setMensajes((anteriores) => [
          ...anteriores,
          {
            id: Date.now() + 1,
            tipo: "asistente",
            texto: respuestaTexto,
            hora: obtenerHora(),
          },
        ]);
      } catch (error) {
        console.error("Error al procesar el documento:", error);

        setMensajes((anteriores) => [
          ...anteriores,
          {
            id: Date.now() + 1,
            tipo: "asistente",
            texto: `No pude leer el documento adjunto.\n\n${error.message}\n\nVerifica que sea un PDF con texto seleccionable e inténtalo nuevamente.`,
            hora: obtenerHora(),
          },
        ]);
      } finally {
        setRespondiendo(false);
      }

      return;
    }

    // =========================================
    // ARCHIVOS QUE TODAVÍA NO SE PUEDEN ANALIZAR
    // =========================================

    if (archivoOriginal && !textoLimpio) {
      setMensajes((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 1,
          tipo: "asistente",
          texto:
            "He recibido el archivo, pero por ahora solo puedo analizar documentos PDF. La lectura de imágenes y videos todavía no está disponible.",
          hora: obtenerHora(),
        },
      ]);

      return;
    }

    // =========================================
    // RESPUESTAS HABITUALES DEL CHATBOT
    // =========================================

    if (!textoLimpio) return;

    setRespondiendo(true);

    respuestaPendiente.current = window.setTimeout(() => {
      const respuestaDocumento = responderPreguntaDocumento(
        textoLimpio,
        documentoContexto,
      );

      const respuesta = respuestaDocumento
        ? {
            texto: respuestaDocumento,
            accion: null,
          }
        : generarRespuesta(textoLimpio);

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

      case "perfil":
        return <ShieldCheck size={18} />;

      case "inicio":
        return <ArrowRight size={18} />;

      default:
        return <ArrowRight size={18} />;
    }
  };

  // =========================================
  // ACCIONES DE LOS MENSAJES
  // =========================================

  const copiarRespuesta = async (id, texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      setMensajeCopiadoId(id);

      setTimeout(() => {
        setMensajeCopiadoId(null);
      }, 1800);
    } catch (error) {
      console.error("No se pudo copiar:", error);
    }
  };

  const valorarRespuesta = (id, valor) => {
    setMensajes((anteriores) =>
      anteriores.map((item) =>
        item.id === id
          ? {
              ...item,
              valoracion: item.valoracion === valor ? null : valor,
            }
          : item,
      ),
    );
  };

  const escucharRespuesta = (id, texto) => {
    if (mensajeEnAudio === id) {
      detenerAudio();
      setMensajeEnAudio(null);
      return;
    }

    detenerAudio();
    setMensajeEnAudio(id);

    reproducirAudio(texto, vozSeleccionada, () => {
      setMensajeEnAudio(null);
    });
  };

  const cambiarVoz = (nombre) => {
    setVozSeleccionada(nombre);
    localStorage.setItem("essalud_voz_asistente", nombre);
    setMenuVozAbierto(null);

    detenerAudio();
    setMensajeEnAudio(null);
  };

  const probarVoz = (nombre) => {
    detenerAudio();

    reproducirAudio(
      "Hola, soy tu asistente virtual de EsSalud Digital. Estoy aquí para ayudarte.",
      nombre,
    );
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

                {/* ACCIONES DE CADA RESPUESTA DEL ASISTENTE */}

                {item.tipo === "asistente" && (
                  <div className="chat-message-actions">
                    <button
                      type="button"
                      className="chat-message-action"
                      onClick={() => copiarRespuesta(item.id, item.texto)}
                      title="Copiar"
                      aria-label="Copiar respuesta"
                    >
                      {mensajeCopiadoId === item.id ? (
                        <Check size={19} />
                      ) : (
                        <Copy size={19} />
                      )}
                    </button>

                    <button
                      type="button"
                      className={`chat-message-action ${
                        item.valoracion === "like" ? "active" : ""
                      }`}
                      onClick={() => valorarRespuesta(item.id, "like")}
                      title="Me gusta"
                      aria-label="Me gusta"
                    >
                      <ThumbsUp size={19} />
                    </button>

                    <button
                      type="button"
                      className={`chat-message-action ${
                        item.valoracion === "dislike" ? "active" : ""
                      }`}
                      onClick={() => valorarRespuesta(item.id, "dislike")}
                      title="No me gusta"
                      aria-label="No me gusta"
                    >
                      <ThumbsDown size={19} />
                    </button>

                    <button
                      type="button"
                      className={`chat-message-action ${
                        mensajeEnAudio === item.id ? "active" : ""
                      }`}
                      onClick={() => escucharRespuesta(item.id, item.texto)}
                      title="Escuchar"
                      aria-label="Escuchar respuesta"
                    >
                      <Volume2 size={20} />
                    </button>

                    {/* MENÚ DE PERSONALIZACIÓN DE VOZ */}
                    <div className="chat-voice-menu-container">
                      <button
                        type="button"
                        className="chat-message-action"
                        onClick={() =>
                          setMenuVozAbierto(
                            menuVozAbierto === item.id ? null : item.id,
                          )
                        }
                        aria-label="Personalizar voz"
                        aria-expanded={menuVozAbierto === item.id}
                        title="Opciones de voz"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {menuVozAbierto === item.id && (
                        <div className="chat-voice-menu">
                          <strong>Personalizar voz</strong>
                          <small>Selecciona una voz para el asistente</small>

                          {[
                            "Google español",
                            "Microsoft Laura - Spanish (Spain)",
                            "Microsoft Helena - Spanish (Spain)",
                            "Microsoft Pablo - Spanish (Spain)",
                          ].map((nombre) => (
                            <div className="chat-voice-option" key={nombre}>
                              <button
                                type="button"
                                className={
                                  vozSeleccionada === nombre ? "selected" : ""
                                }
                                onClick={() => cambiarVoz(nombre)}
                              >
                                <span>{nombre}</span>
                                {vozSeleccionada === nombre && (
                                  <Check size={17} />
                                )}
                              </button>

                              <button
                                type="button"
                                className="chat-voice-test"
                                onClick={() => probarVoz(nombre)}
                                title="Probar voz"
                                aria-label={`Probar ${nombre}`}
                              >
                                <Volume2 size={17} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                  <small>Solo archivos PDF</small>
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
