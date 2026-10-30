import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  UsersRound,
  CalendarDays,
  CreditCard,
  HeartPulse,
  ChevronRight,
  House,
  CircleHelp,
  FileText,
  FlaskConical,
  ClipboardList,
  Trash2,
  Info,
  MessageCircle,
  User,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import BottomNavigation from "../components/BottomNavigation";

import {
  obtenerFamiliaresVinculados,
  obtenerUsuarioActivo,
} from "../services/usuariosService.js";

export default function DetalleFamiliar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dni } = useParams();

  const usuario = obtenerUsuarioActivo();
  const pacienteRecibido = location.state?.paciente;

  const familiares = obtenerFamiliaresVinculados(usuario?.dni);

  const familiarRegistrado = familiares.find(
    (familiar) => String(familiar.dni) === String(dni),
  );

  const familiar =
    familiarRegistrado ||
    (String(pacienteRecibido?.dni) === String(dni) ? pacienteRecibido : null);

  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") navigate("/essalud/citas");
    if (id === "recetas") navigate("/essalud/recetas");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  const volverAFamiliares = () => {
    navigate("/essalud/familiares");
  };

  if (!usuario) {
    return (
      <main className="detalle-familiar-page">
        <section className="detalle-familiar-error">
          <UserRound size={38} />
          <h2>Inicia sesión</h2>
          <p>Necesitas iniciar sesión para consultar este perfil.</p>
          <button type="button" onClick={() => navigate("/essalud/login")}>
            Ir al inicio de sesión
          </button>
        </section>
      </main>
    );
  }

  if (!familiar) {
    return (
      <main className="detalle-familiar-page">
  <header className="appointments-header">
    <button
      type="button"
      className="appointments-back"
      onClick={volverAFamiliares}
      aria-label="Volver a familiares"
    >
      <ArrowLeft size={23} />
    </button>

    <h1>Detalle del familiar</h1>

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
          "Aquí puedes consultar la información y los servicios disponibles para tu familiar."
        )
      }
    >
      <CircleHelp size={18} />
    </button>
  </header>

        <section className="detalle-familiar-error">
          <UsersRound size={40} />
          <h2>Perfil no encontrado</h2>
          <p>
            Este familiar no está vinculado a tu cuenta o ya no está disponible.
          </p>
          <button type="button" onClick={volverAFamiliares}>
            Volver a familiares
          </button>
        </section>

        <BottomNavigation active="perfil" onNavigate={navegarMenu} />
      </main>
    );
  }

  const nombre = familiar.nombres || "Familiar";
  const documento = familiar.dni || dni;
  const parentesco = familiar.relation || "Familiar";

  const manejarDesvinculacion = () => {
    const confirmar = window.confirm(
      `¿Estás segura de que deseas desvincular a ${nombre} de tu cuenta?`,
    );

    if (!confirmar) return;

    // Aquí debes conectar la función de desvinculación de tu servicio.
    window.alert(
      "La desvinculación todavía necesita conectarse con usuariosService.js.",
    );
  };

  return (
    <main className="detalle-familiar-page">
      {/* ENCABEZADO REUTILIZADO DE MIS CITAS */}
      {/* ENCABEZADO */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={volverAFamiliares}
          aria-label="Volver a familiares"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Detalle del familiar</h1>

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
              "Aquí puedes consultar la información y los servicios disponibles para tu familiar.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <section className="detalle-familiar-content">
        {/* PERFIL */}
        <div className="detalle-familiar-profile">
          <div
            className="detalle-familiar-avatar"
            style={{
              backgroundColor: familiar.color || "#DCEEFF",
            }}
          >
            {familiar.avatar || <UserRound size={38} />}
          </div>

          <span className="detalle-profile-label">Perfil familiar</span>

          <h2>{nombre}</h2>

          <span className="detalle-parentesco">{parentesco}</span>

          <p>
            Consulta la información y los servicios de salud de tu familiar.
          </p>
        </div>

        {/* AVISO */}
        <div className="detalle-family-notice">
          <span className="detalle-notice-icon">
            <UsersRound size={22} />
          </span>

          <p>
            Esta cuenta está vinculada a tu perfil para que puedas gestionar sus
            atenciones.
          </p>
        </div>

        {/* INFORMACIÓN BÁSICA */}
        <section className="detalle-info-section">
          <h3>Información básica</h3>

          <div className="detalle-info-card">
            <div className="detalle-info-icon">
              <UserRound size={21} />
            </div>

            <div className="detalle-info-text">
              <span>Nombres completos</span>
              <strong>{nombre}</strong>
            </div>
          </div>

          <div className="detalle-info-card">
            <div className="detalle-info-icon">
              <CreditCard size={21} />
            </div>

            <div className="detalle-info-text">
              <span>Documento de identidad</span>
              <strong>DNI: {documento}</strong>
            </div>
          </div>

          <div className="detalle-info-card">
            <div className="detalle-info-icon">
              <UsersRound size={21} />
            </div>

            <div className="detalle-info-text">
              <span>Parentesco</span>
              <strong>{parentesco}</strong>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="detalle-options-section">
          <h3>Servicios disponibles</h3>

          <button
            type="button"
            className="detalle-option"
            onClick={() =>
              navigate("/essalud/citas", {
                state: { paciente: familiar },
              })
            }
          >
            <span className="detalle-option-icon">
              <CalendarDays size={21} />
            </span>

            <span>
              <strong>Mis citas</strong>
              <small>Consultar las citas médicas</small>
            </span>

            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            className="detalle-option"
            onClick={() =>
              navigate("/essalud/recetas", {
                state: { paciente: familiar },
              })
            }
          >
            <span className="detalle-option-icon">
              <FileText size={21} />
            </span>

            <span>
              <strong>Recetas</strong>
              <small>Consultar sus recetas médicas</small>
            </span>

            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            className="detalle-option"
            onClick={() =>
              window.alert("Aquí se mostrarán los exámenes del familiar.")
            }
          >
            <span className="detalle-option-icon">
              <FlaskConical size={21} />
            </span>

            <span>
              <strong>Exámenes</strong>
              <small>Revisar sus resultados de laboratorio</small>
            </span>

            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            className="detalle-option"
            onClick={() =>
              window.alert("Aquí se mostrarán los descansos médicos.")
            }
          >
            <span className="detalle-option-icon">
              <ClipboardList size={21} />
            </span>

            <span>
              <strong>Descansos médicos</strong>
              <small>Consultar sus descansos médicos</small>
            </span>

            <ChevronRight size={20} />
          </button>
        </section>

        {/* DESVINCULAR */}
        <button
          type="button"
          className="detalle-unlink-button"
          onClick={manejarDesvinculacion}
        >
          <Trash2 size={17} />
          Desvincular cuenta
        </button>

        {/* INFORMACIÓN */}
        <div className="detalle-family-info">
          <Info size={19} />

          <p>Podrás volver a vincular esta cuenta cuando lo necesites.</p>
        </div>

        {/* VOLVER */}
        <button
          type="button"
          className="detalle-home-button"
          onClick={() => navigate("/essalud/inicio")}
        >
          <House size={19} />
          Volver al inicio
        </button>
      </section>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation active="perfil" onNavigate={navegarMenu} />
    </main>
  );
}
