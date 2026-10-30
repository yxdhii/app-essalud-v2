
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
} from "lucide-react";

import {
  obtenerFamiliaresVinculados,
  obtenerUsuarioActivo,
} from "../services/usuariosService.js";

export default function DetalleFamiliar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dni } = useParams();

  const usuario = obtenerUsuarioActivo();

  // Recuperamos el familiar enviado desde SeleccionarPerfil.
  const pacienteRecibido = location.state?.paciente;

  // Consultamos los familiares vinculados al titular actual.
  const familiares = obtenerFamiliaresVinculados(usuario?.dni);

  // Buscamos el familiar por su DNI.
  const familiarRegistrado = familiares.find(
    (familiar) => String(familiar.dni) === String(dni),
  );

  // Usamos el dato recibido si existe; de lo contrario, el registrado.
  const familiar =
    familiarRegistrado ||
    (String(pacienteRecibido?.dni) === String(dni)
      ? pacienteRecibido
      : null);

  if (!usuario) {
    return (
      <main className="detalle-familiar-page">
        <section className="detalle-familiar-error">
          <h2>Inicia sesión</h2>
          <p>Necesitas iniciar sesión para consultar este perfil.</p>

          <button
            type="button"
            onClick={() => navigate("/essalud/login")}
          >
            Ir al inicio de sesión
          </button>
        </section>
      </main>
    );
  }

  if (!familiar) {
    return (
      <main className="detalle-familiar-page">
        <header className="detalle-familiar-header">
          <button
            type="button"
            className="detalle-back-button"
            onClick={() => navigate("/essalud/familiares")}
            aria-label="Volver a familiares"
          >
            <ArrowLeft size={22} />
          </button>

          <h1>Detalle del familiar</h1>
        </header>

        <section className="detalle-familiar-error">
          <UsersRound size={42} />

          <h2>Perfil no encontrado</h2>

          <p>
            Este familiar no está vinculado a tu cuenta o ya no está
            disponible.
          </p>

          <button
            type="button"
            onClick={() => navigate("/essalud/familiares")}
          >
            Volver a familiares
          </button>
        </section>
      </main>
    );
  }

  const nombre = familiar.nombres || "Familiar";
  const documento = familiar.dni || dni;
  const parentesco = familiar.relation || "Familiar";

  return (
    <main className="detalle-familiar-page">
      <header className="detalle-familiar-header">
        <button
          type="button"
          className="detalle-back-button"
          onClick={() => navigate("/essalud/familiares")}
          aria-label="Volver a familiares"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1>Detalle del familiar</h1>
          <p>EsSalud Digital</p>
        </div>
      </header>

      <section className="detalle-familiar-content">
        <div className="detalle-familiar-profile">
          <div
            className="detalle-familiar-avatar"
            style={{
              backgroundColor: familiar.color || "#DCEEFF",
            }}
          >
            {familiar.avatar || <UserRound size={38} />}
          </div>

          <span className="detalle-profile-label">
            Perfil familiar
          </span>

          <h2>{nombre}</h2>

          <span className="detalle-parentesco">
            {parentesco}
          </span>

          <p>
            Consulta la información del familiar seleccionado.
          </p>
        </div>

        <section className="detalle-info-section">
          <h3>Información personal</h3>

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
              navigate("/essalud/inicio", {
                state: { paciente: familiar },
              })
            }
          >
            <span className="detalle-option-icon">
              <HeartPulse size={21} />
            </span>

            <span>
              <strong>Servicios de salud</strong>
              <small>Ir a los servicios disponibles</small>
            </span>

            <ChevronRight size={20} />
          </button>
        </section>

        <button
          type="button"
          className="detalle-return-button"
          onClick={() => navigate("/essalud/familiares")}
        >
          <UsersRound size={19} />
          Volver a mis familiares
        </button>

        <button
          type="button"
          className="detalle-home-button"
          onClick={() => navigate("/essalud/inicio")}
        >
          <House size={19} />
          Ir al inicio
        </button>
      </section>
    </main>
  );
}
