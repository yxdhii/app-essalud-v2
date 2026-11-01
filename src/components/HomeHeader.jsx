
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  Bell,
  CalendarDays,
  Pill,
  FlaskConical,
  X,
  ChevronRight,
  BellRing,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import headerMujer from "../assets/header-mujer.png";
import HomeSidebar from "./HomeSidebar";

const CLAVE_NOTIFICACIONES = "essalud_notificaciones";

// Los iconos se mantienen fuera de los datos almacenados
const iconosNotificacion = {
  cita: CalendarDays,
  receta: Pill,
  examen: FlaskConical,
};

const notificacionesIniciales = [
  {
    id: 1,
    tipo: "cita",
    titulo: "Citas médicas",
    mensaje:
      "Aquí recibirás información sobre tus citas confirmadas y próximos recordatorios.",
    fecha: "Atención médica",
    leida: false,
    ruta: "/essalud/citas",
  },
  {
    id: 2,
    tipo: "receta",
    titulo: "Recetas médicas",
    mensaje:
      "Te avisaremos cuando tu médico emita una nueva receta médica.",
    fecha: "Información médica",
    leida: false,
    ruta: "/essalud/recetas",
  },
  {
    id: 3,
    tipo: "examen",
    titulo: "Exámenes médicos",
    mensaje:
      "Recibirás una notificación cuando los resultados de tus exámenes estén disponibles.",
    fecha: "Resultados médicos",
    leida: false,
    ruta: "/essalud/examenes",
  },
];

export default function HomeHeader({ user }) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState(
    notificacionesIniciales
  );

  const nombreUsuario = user?.nombres || user?.name || "Usuario";

  const pendientes = notificaciones.filter(
    (item) => !item.leida
  ).length;

  // CARGAR NOTIFICACIONES
  useEffect(() => {
    try {
      const almacenadas = JSON.parse(
        localStorage.getItem(CLAVE_NOTIFICACIONES) || "null"
      );

      if (Array.isArray(almacenadas)) {
        // Normalizar datos antiguos y evitar componentes dentro de localStorage
        const normalizadas = almacenadas.map((item) => ({
          id: item.id,
          tipo: item.tipo || "cita",
          titulo: item.titulo || "Notificación",
          mensaje: item.mensaje || "",
          fecha: item.fecha || "",
          leida: Boolean(item.leida),
          ruta: item.ruta || "",
        }));

        setNotificaciones(normalizadas);

        localStorage.setItem(
          CLAVE_NOTIFICACIONES,
          JSON.stringify(normalizadas)
        );
      } else {
        setNotificaciones(notificacionesIniciales);

        localStorage.setItem(
          CLAVE_NOTIFICACIONES,
          JSON.stringify(notificacionesIniciales)
        );
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotificaciones(notificacionesIniciales);
    }
  }, []);

  // ESCUCHAR CAMBIOS EN LAS NOTIFICACIONES
  useEffect(() => {
    const actualizarNotificaciones = () => {
      try {
        const almacenadas = JSON.parse(
          localStorage.getItem(CLAVE_NOTIFICACIONES) || "[]"
        );

        if (Array.isArray(almacenadas)) {
          setNotificaciones(
            almacenadas.map((item) => ({
              id: item.id,
              tipo: item.tipo || "cita",
              titulo: item.titulo || "Notificación",
              mensaje: item.mensaje || "",
              fecha: item.fecha || "",
              leida: Boolean(item.leida),
              ruta: item.ruta || "",
            }))
          );
        }
      } catch (error) {
        console.error("Error al actualizar notificaciones:", error);
      }
    };

    window.addEventListener(
      "essalud-notificacion",
      actualizarNotificaciones
    );

    window.addEventListener("storage", actualizarNotificaciones);

    return () => {
      window.removeEventListener(
        "essalud-notificacion",
        actualizarNotificaciones
      );

      window.removeEventListener("storage", actualizarNotificaciones);
    };
  }, []);

  // CERRAR PANEL CON ESCAPE
  useEffect(() => {
    const cerrarConEscape = (event) => {
      if (event.key === "Escape") {
        setNotificacionesOpen(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  // GUARDAR NOTIFICACIONES
  const guardarNotificaciones = (lista) => {
    setNotificaciones(lista);

    localStorage.setItem(
      CLAVE_NOTIFICACIONES,
      JSON.stringify(lista)
    );

    window.dispatchEvent(new Event("essalud-notificacion"));
  };

  // MARCAR COMO LEÍDA
  const marcarComoLeida = (id) => {
    const actualizadas = notificaciones.map((item) =>
      item.id === id ? { ...item, leida: true } : item
    );

    guardarNotificaciones(actualizadas);
  };

  // ABRIR PANTALLA COMPLETA
  const verTodas = () => {
    setNotificacionesOpen(false);
    navigate("/essalud/notificaciones");
  };

  // ABRIR MÓDULO CORRESPONDIENTE
  const abrirNotificacion = (item) => {
    marcarComoLeida(item.id);
    setNotificacionesOpen(false);

    if (item.ruta) {
      navigate(item.ruta);
    }
  };

  return (
    <>
      <header className="home-header">

        {/* BARRA SUPERIOR */}
        <div className="home-header-top">
          <button
            type="button"
            className="header-icon-button"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={23} strokeWidth={1.8} />
          </button>

          <img
            src={logoEssalud}
            alt="EsSalud Digital"
            className="header-logo"
          />

          {/* BOTÓN DE NOTIFICACIONES */}
          <button
            type="button"
            className={`header-icon-button notification-button ${
              notificacionesOpen ? "active" : ""
            }`}
            aria-label={`Ver notificaciones: ${pendientes} sin leer`}
            aria-expanded={notificacionesOpen}
            onClick={() =>
              setNotificacionesOpen((prev) => !prev)
            }
          >
            <Bell size={22} strokeWidth={1.8} />

            {pendientes > 0 && (
              <span className="notification-count">
                {pendientes > 9 ? "9+" : pendientes}
              </span>
            )}
          </button>
        </div>

        {/* PANEL DE NOTIFICACIONES */}
        {notificacionesOpen && (
          <>
            <div
              className="notifications-backdrop"
              onClick={() => setNotificacionesOpen(false)}
            />

            <div className="notifications-panel">
              <div className="notifications-panel-header">
                <div>
                  <h3>Notificaciones</h3>
                  <p>
                    {pendientes > 0
                      ? `Tienes ${pendientes} pendientes`
                      : "Estás al día"}
                  </p>
                </div>

                <button
                  type="button"
                  className="notifications-close"
                  aria-label="Cerrar notificaciones"
                  onClick={() => setNotificacionesOpen(false)}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="notifications-list">
                {notificaciones.length > 0 ? (
                  notificaciones.slice(0, 5).map((item) => {
                    const Icono =
                      iconosNotificacion[item.tipo] || Bell;

                    return (
                      <button
                        type="button"
                        className={`notification-item ${
                          !item.leida ? "unread" : ""
                        }`}
                        key={item.id}
                        onClick={() => abrirNotificacion(item)}
                      >
                        <div
                          className={`notification-item-icon ${item.tipo}`}
                        >
                          <Icono size={21} />
                        </div>

                        <div className="notification-item-content">
                          <div className="notification-item-title">
                            <strong>{item.titulo}</strong>

                            {!item.leida && (
                              <span className="notification-unread-dot" />
                            )}
                          </div>

                          <p>{item.mensaje}</p>

                          <span>{item.fecha}</span>
                        </div>

                        <ChevronRight
                          size={18}
                          className="notification-item-arrow"
                        />
                      </button>
                    );
                  })
                ) : (
                  <div className="notification-empty">
                    <BellRing size={30} />
                    <strong>No tienes notificaciones</strong>
                    <p>Aquí recibirás tus avisos médicos.</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="notifications-view-all"
                onClick={verTodas}
              >
                Ver todas las notificaciones
                <ChevronRight size={17} />
              </button>
            </div>
          </>
        )}

        {/* BIENVENIDA */}
        <section className="home-welcome">
          <img
            src={headerMujer}
            alt=""
            aria-hidden="true"
            className="welcome-image"
          />

          <div className="welcome-text">
            <span>¡Hola!</span>
            <h1>{nombreUsuario}</h1>
            <p>¿Cómo podemos ayudarte hoy?</p>
          </div>
        </section>
      </header>

      {/* MENÚ LATERAL */}
      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
    </>
  );
}
