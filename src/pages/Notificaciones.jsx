
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  X,
  Settings,
  CalendarDays,
  Pill,
  FlaskConical,
  BellRing,
  ChevronRight,
  Check,
  Trash2,
  CheckCheck,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";

const CLAVE_NOTIFICACIONES = "essalud_notificaciones";

const iconosNotificacion = {
  cita: CalendarDays,
  receta: Pill,
  examen: FlaskConical,
};

const obtenerGrupoFecha = (fecha) => {
  if (!fecha) return "Anteriores";

  const fechaNotificacion = new Date(fecha);

  if (Number.isNaN(fechaNotificacion.getTime())) {
    return "Anteriores";
  }

  const hoy = new Date();

  if (fechaNotificacion.toDateString() === hoy.toDateString()) {
    return "Hoy";
  }

  return "Anteriores";
};

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  const fechaNotificacion = new Date(fecha);

  if (Number.isNaN(fechaNotificacion.getTime())) {
    return fecha;
  }

  if (obtenerGrupoFecha(fecha) === "Hoy") {
    return `Hoy · ${fechaNotificacion.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return fechaNotificacion.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Notificaciones() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const [notificaciones, setNotificaciones] = useState([]);
  const [activeTab, setActiveTab] = useState("Todas");
  const [configuracionOpen, setConfiguracionOpen] = useState(false);
  const [avisosActivos, setAvisosActivos] = useState(true);

  // CARGAR NOTIFICACIONES DEL USUARIO
  useEffect(() => {
    const cargarNotificaciones = () => {
      try {
        const almacenadas = JSON.parse(
          localStorage.getItem(CLAVE_NOTIFICACIONES) || "[]"
        );

        if (!Array.isArray(almacenadas)) {
          setNotificaciones([]);
          return;
        }

        const filtradas = almacenadas
          .filter(
            (item) =>
              !item.dni ||
              String(item.dni) === String(usuario?.dni || "")
          )
          .map((item) => ({
            id: item.id,
            tipo: item.tipo || "cita",
            titulo: item.titulo || "Notificación",
            mensaje: item.mensaje || "",
            fecha: item.fecha || "",
            leida: Boolean(item.leida),
            ruta: item.ruta || "",
          }));

        setNotificaciones(filtradas);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        setNotificaciones([]);
      }
    };

    cargarNotificaciones();

    window.addEventListener("essalud-notificacion", cargarNotificaciones);
    window.addEventListener("storage", cargarNotificaciones);

    return () => {
      window.removeEventListener(
        "essalud-notificacion",
        cargarNotificaciones
      );
      window.removeEventListener("storage", cargarNotificaciones);
    };
  }, [usuario?.dni]);

  // GUARDAR NOTIFICACIONES
  const guardarNotificaciones = (lista) => {
    try {
      const todas = JSON.parse(
        localStorage.getItem(CLAVE_NOTIFICACIONES) || "[]"
      );

      const dniActual = String(usuario?.dni || "");

      const otrasCuentas = todas.filter(
        (item) => String(item.dni || "") !== dniActual
      );

      const actualizadas = [...otrasCuentas, ...lista];

      localStorage.setItem(
        CLAVE_NOTIFICACIONES,
        JSON.stringify(actualizadas)
      );

      setNotificaciones(lista);

      window.dispatchEvent(new Event("essalud-notificacion"));
    } catch (error) {
      console.error("Error al guardar notificaciones:", error);
    }
  };

  // CONTADORES
  const pendientes = notificaciones.filter(
    (item) => !item.leida
  ).length;

  // FILTRAR POR PESTAÑA
  const notificacionesFiltradas = useMemo(() => {
    if (activeTab === "No leídas") {
      return notificaciones.filter((item) => !item.leida);
    }

    return notificaciones;
  }, [notificaciones, activeTab]);

  // AGRUPAR POR FECHA
  const notificacionesHoy = notificacionesFiltradas.filter(
    (item) => obtenerGrupoFecha(item.fecha) === "Hoy"
  );

  const notificacionesAnteriores = notificacionesFiltradas.filter(
    (item) => obtenerGrupoFecha(item.fecha) !== "Hoy"
  );

  // MARCAR COMO LEÍDA
  const marcarComoLeida = (id) => {
    const actualizadas = notificaciones.map((item) =>
      item.id === id ? { ...item, leida: true } : item
    );

    guardarNotificaciones(actualizadas);
  };

  // MARCAR TODAS COMO LEÍDAS
  const marcarTodasLeidas = () => {
    guardarNotificaciones(
      notificaciones.map((item) => ({
        ...item,
        leida: true,
      }))
    );
  };

  // ELIMINAR NOTIFICACIÓN
  const eliminarNotificacion = (id) => {
    guardarNotificaciones(
      notificaciones.filter((item) => item.id !== id)
    );
  };

  // ABRIR NOTIFICACIÓN
  const abrirNotificacion = (item) => {
    marcarComoLeida(item.id);

    if (item.ruta) {
      navigate(item.ruta);
    }
  };

  // NAVEGACIÓN INFERIOR
  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") navigate("/essalud/citas");
    if (id === "recetas") navigate("/essalud/recetas");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  // TARJETA DE NOTIFICACIÓN
  const renderizarNotificacion = (item) => {
    const Icono = iconosNotificacion[item.tipo] || BellRing;

    return (
      <article
        className={`notification-page-card ${
          !item.leida ? "unread" : ""
        }`}
        key={item.id}
      >
        <button
          type="button"
          className="notification-page-main"
          onClick={() => abrirNotificacion(item)}
        >
          <div className={`notification-page-icon ${item.tipo}`}>
            <Icono size={22} strokeWidth={1.9} />
          </div>

          <div className="notification-page-info">
            <div className="notification-page-title">
              <h3>{item.titulo}</h3>

              {!item.leida && (
                <span className="notification-page-dot" />
              )}
            </div>

            <p>{item.mensaje}</p>

            <span className="notification-page-date">
              {formatearFecha(item.fecha)}
            </span>
          </div>

          <ChevronRight
            size={20}
            className="notification-page-arrow"
          />
        </button>

        <div className="notification-page-actions">
          {!item.leida && (
            <button
              type="button"
              aria-label="Marcar como leída"
              onClick={() => marcarComoLeida(item.id)}
            >
              <Check size={15} />
            </button>
          )}

          <button
            type="button"
            aria-label="Eliminar notificación"
            onClick={() => eliminarNotificacion(item.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className="appointments-screen notifications-page">

      {/* ENCABEZADO REUTILIZADO DE MIS CITAS */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/inicio")}
          aria-label="Cerrar notificaciones y regresar al inicio"
        >
          <X size={23} />
        </button>

        <h1>Notificaciones</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          className="reservar-help notifications-settings-button"
          type="button"
          aria-label="Configuración de notificaciones"
          aria-expanded={configuracionOpen}
          onClick={() => setConfiguracionOpen(!configuracionOpen)}
        >
          <Settings size={19} />
        </button>
      </header>

      {/* CONFIGURACIÓN */}
      {configuracionOpen && (
        <section className="notification-settings-panel">
          <div className="notification-settings-heading">
            <div>
              <h3>Configuración</h3>
              <p>Preferencias de notificaciones</p>
            </div>

            <button
              type="button"
              onClick={() => setConfiguracionOpen(false)}
              aria-label="Cerrar configuración"
            >
              <X size={18} />
            </button>
          </div>

          <label className="notification-setting">
            <div>
              <strong>Avisos de atención médica</strong>
              <p>Recibir avisos sobre citas, recetas y exámenes.</p>
            </div>

            <input
              type="checkbox"
              checked={avisosActivos}
              onChange={(e) => setAvisosActivos(e.target.checked)}
            />
          </label>
        </section>
      )}

      {/* PESTAÑAS */}
      <div className="appointments-tabs notification-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "Todas"}
          className={activeTab === "Todas" ? "active" : ""}
          onClick={() => setActiveTab("Todas")}
        >
          Todas
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "No leídas"}
          className={activeTab === "No leídas" ? "active" : ""}
          onClick={() => setActiveTab("No leídas")}
        >
          No leídas
          {pendientes > 0 && (
            <span className="notification-tab-count">
              {pendientes}
            </span>
          )}
        </button>
      </div>

      {/* ACCIONES */}
      {notificacionesFiltradas.length > 0 && pendientes > 0 && (
        <div className="notification-page-toolbar">
          <span>{pendientes} notificación(es) sin leer</span>

          <button type="button" onClick={marcarTodasLeidas}>
            <CheckCheck size={15} />
            Marcar todas como leídas
          </button>
        </div>
      )}

      {/* CONTENIDO */}
      <section className="appointments-content notifications-page-content">

        {notificacionesHoy.length > 0 && (
          <section className="notification-page-section">
            <h2>Hoy</h2>

            {notificacionesHoy.map(renderizarNotificacion)}
          </section>
        )}

        {notificacionesAnteriores.length > 0 && (
          <section className="notification-page-section">
            <h2>Anteriores</h2>

            {notificacionesAnteriores.map(renderizarNotificacion)}
          </section>
        )}

        {notificacionesFiltradas.length === 0 && (
          <div className="notification-page-empty">
            <div className="notification-page-empty-icon">
              <BellRing size={35} />
            </div>

            <h2>
              {activeTab === "No leídas"
                ? "¡Estás al día!"
                : "No tienes notificaciones"}
            </h2>

            <p>
              Aquí recibirás avisos sobre tus citas médicas,
              recetas y resultados de exámenes.
            </p>

            {activeTab === "No leídas" && (
              <button
                type="button"
                onClick={() => setActiveTab("Todas")}
              >
                Ver todas
              </button>
            )}
          </div>
        )}
      </section>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation
        active="inicio"
        onNavigate={navegarMenu}
      />
    </main>
  );
}
