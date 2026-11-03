
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  CalendarDays,
  UsersRound,
  FileText,
  LockKeyhole,
  ChevronDown,
  ChevronUp,
  Search,
  Headset,
  MessageCircle,
  Send,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

const preguntas = [
  {
    categoria: "Citas médicas",
    pregunta: "¿Cómo puedo reservar una cita?",
    respuesta:
      "Ingresa a la sección de Citas, selecciona Reservar cita y sigue los pasos: elige el tipo de atención, especialidad, médico, fecha y horario. Finalmente, confirma tu reserva.",
    icono: CalendarDays,
  },
  {
    categoria: "Citas médicas",
    pregunta: "¿Dónde puedo consultar mis citas?",
    respuesta:
      "Entra a Mis citas desde el menú inferior. Allí podrás consultar las citas que hayas registrado en la aplicación.",
    icono: CalendarDays,
  },
  {
    categoria: "Familiares",
    pregunta: "¿Cómo puedo agregar a un familiar?",
    respuesta:
      "Ingresa a Mi perfil, selecciona la opción Familiares y utiliza la opción para agregar o vincular un familiar.",
    icono: UsersRound,
  },
  {
    categoria: "Familiares",
    pregunta: "¿Cómo puedo desvincular a un familiar?",
    respuesta:
      "Entra al perfil del familiar y selecciona Desvincular cuenta. Antes de completar la acción, tendrás que confirmar tu decisión.",
    icono: UsersRound,
  },
  {
    categoria: "Recetas",
    pregunta: "¿Dónde puedo revisar mis recetas?",
    respuesta:
      "Selecciona Recetas desde tu aplicación para consultar las recetas médicas disponibles.",
    icono: FileText,
  },
  {
    categoria: "Cuenta",
    pregunta: "¿Cómo puedo cambiar mi contraseña?",
    respuesta:
      "Desde Mi perfil, ingresa a Seguridad de mi cuenta y selecciona la opción para cambiar tu contraseña.",
    icono: LockKeyhole,
  },
  {
    categoria: "Cuenta",
    pregunta: "¿Cómo puedo actualizar mis datos personales?",
    respuesta:
      "Ingresa a Mi perfil y selecciona Mis datos personales para consultar y actualizar la información disponible.",
    icono: ShieldCheck,
  },
];

const categorias = [
  "Todas",
  "Citas médicas",
  "Familiares",
  "Recetas",
  "Cuenta",
];

export default function AyudaSoporte() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [asunto, setAsunto] = useState("Consulta general");
  const [mensaje, setMensaje] = useState("");
  const [consultaEnviada, setConsultaEnviada] = useState(false);

  const preguntasFiltradas = preguntas.filter((item) => {
    const coincideCategoria =
      categoria === "Todas" || item.categoria === categoria;

    const texto = `${item.pregunta} ${item.respuesta}`.toLowerCase();

    return (
      coincideCategoria &&
      texto.includes(busqueda.toLowerCase())
    );
  });

  const navegarMenu = (id) => {
    const rutas = {
      inicio: "/essalud/inicio",
      citas: "/essalud/citas",
      chat: "/essalud/chat",
      perfil: "/essalud/perfil",
    };

    if (rutas[id]) {
      navigate(rutas[id]);
    }
  };

  const alternarPregunta = (pregunta) => {
    setPreguntaAbierta((actual) =>
      actual === pregunta ? null : pregunta
    );
  };

  const enviarConsulta = (e) => {
    e.preventDefault();

    if (!mensaje.trim()) return;

    setConsultaEnviada(true);
    setMensaje("");
  };

  return (
    <main className="appointments-screen ayuda-screen">

      {/* ENCABEZADO */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/perfil")}
          aria-label="Volver al perfil"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Ayuda y soporte</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          className="reservar-help"
          type="button"
          aria-label="Ayuda"
          onClick={() => {
            setBusqueda("");
            setCategoria("Todas");
            setPreguntaAbierta(null);
          }}
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}
      <section className="ayuda-content">

        {/* PRESENTACIÓN */}
        <div className="ayuda-hero">
          <div className="ayuda-hero-icon">
            <Headset size={27} />
          </div>

          <div>
            <span className="ayuda-eyebrow">
              CENTRO DE AYUDA
            </span>

            <h2>¿En qué podemos ayudarte?</h2>

            <p>
              Encuentra respuestas y orientación para utilizar
              EsSalud Digital.
            </p>
          </div>
        </div>

        {/* BUSCADOR */}
        <label className="ayuda-search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Buscar una pregunta..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPreguntaAbierta(null);
            }}
          />
        </label>

        {/* PREGUNTAS FRECUENTES */}
        <section className="ayuda-faq-section">

          <div className="ayuda-section-heading">
            <div>
              <span className="ayuda-eyebrow">
                RESOLVEMOS TUS DUDAS
              </span>

              <h3>Preguntas frecuentes</h3>
            </div>

            <CircleHelp size={23} />
          </div>

          {/* CATEGORÍAS */}
          <div className="ayuda-categories">
            {categorias.map((item) => (
              <button
                key={item}
                type="button"
                className={categoria === item ? "active" : ""}
                onClick={() => {
                  setCategoria(item);
                  setPreguntaAbierta(null);
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* LISTA DE PREGUNTAS */}
          <div className="ayuda-faq-list">

            {preguntasFiltradas.map((item) => {
              const Icono = item.icono;
              const abierta =
                preguntaAbierta === item.pregunta;

              return (
                <article
                  className={`ayuda-faq-item ${
                    abierta ? "open" : ""
                  }`}
                  key={item.pregunta}
                >
                  <button
                    type="button"
                    className="ayuda-faq-question"
                    onClick={() =>
                      alternarPregunta(item.pregunta)
                    }
                    aria-expanded={abierta}
                  >
                    <span className="ayuda-faq-icon">
                      <Icono size={19} />
                    </span>

                    <span className="ayuda-faq-title">
                      {item.pregunta}
                    </span>

                    {abierta ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>

                  {abierta && (
                    <div className="ayuda-faq-answer">
                      <p>{item.respuesta}</p>
                    </div>
                  )}
                </article>
              );
            })}

            {preguntasFiltradas.length === 0 && (
              <div className="ayuda-empty">
                <Search size={28} />

                <strong>No encontramos resultados</strong>

                <p>
                  Prueba con otras palabras o selecciona
                  otra categoría.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* CONTACTO TELEFÓNICO Y FORMULARIO */}
        <section className="ayuda-contact-section">

          <div className="ayuda-contact-card">

            <div className="ayuda-contact-icon">
              <Headset size={26} />
            </div>

            <span className="ayuda-eyebrow">
              ATENCIÓN Y ORIENTACIÓN
            </span>

            <h3>¿Necesitas más ayuda?</h3>

            <p>
              Comunícate con nuestro servicio de atención
              para recibir orientación.
            </p>

            {/* NÚMERO DE CONTACTO */}
            <div className="ayuda-phone">
              <span className="ayuda-phone-icon">
                <MessageCircle size={21} />
              </span>

              <div>
                <small>Consultas al</small>
                <strong>350 0800</strong>
                <span>Opción 2 para Lima y Callao</span>
              </div>
            </div>

            {/* BOTÓN FORMULARIO */}
            <button
              type="button"
              className="ayuda-contact-button"
              onClick={() => {
                setFormularioAbierto(!formularioAbierto);
                setConsultaEnviada(false);
              }}
            >
              {formularioAbierto
                ? "Cerrar formulario"
                : "Enviar una consulta"}

              <MessageCircle size={17} />
            </button>

          </div>

          {/* FORMULARIO */}
          {formularioAbierto && (
            <form
              className="ayuda-form"
              onSubmit={enviarConsulta}
            >
              <h3>Formulario de soporte</h3>

              {consultaEnviada ? (
                <div className="ayuda-success">
                  <CheckCircle2 size={32} />

                  <strong>¡Consulta registrada!</strong>

                  <p>
                    Tu consulta se registró de manera demostrativa.
                    Este prototipo no realiza envíos a un canal real.
                  </p>

                  <button
                    type="button"
                    onClick={() => setConsultaEnviada(false)}
                  >
                    Escribir otra consulta
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="ayuda-asunto">
                    Tema de consulta
                  </label>

                  <select
                    id="ayuda-asunto"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                  >
                    <option>Consulta general</option>
                    <option>Consulta sobre citas</option>
                    <option>Consulta sobre recetas</option>
                    <option>Problemas con mi cuenta</option>
                    <option>Gestión de familiares</option>
                    <option>Otro motivo</option>
                  </select>

                  <label htmlFor="ayuda-mensaje">
                    Describe tu consulta
                  </label>

                  <textarea
                    id="ayuda-mensaje"
                    rows={4}
                    placeholder="Escribe aquí tu consulta..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="ayuda-submit"
                    disabled={!mensaje.trim()}
                  >
                    Enviar consulta
                    <Send size={17} />
                  </button>
                </>
              )}
            </form>
          )}

        </section>

        {/* AVISO */}
        <div className="ayuda-information">
          <ShieldCheck size={20} />

          <p>
            Estamos comprometidos con brindarte una experiencia
            digital accesible, sencilla y segura.
          </p>
        </div>

        <p className="ayuda-prototype-note">
          Centro de ayuda representativo del prototipo académico.
        </p>

      </section>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation
        active="perfil"
        onNavigate={navegarMenu}
      />

    </main>
  );
}
