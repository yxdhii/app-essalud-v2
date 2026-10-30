import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Plus, ChevronRight, CircleHelp } from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";

export default function CambiarCuenta() {
  const navigate = useNavigate();

  const encabezado = (
    <header className="appointments-header">
      <button
        type="button"
        className="appointments-back"
        onClick={() => navigate(-1)}
        aria-label="Regresar"
      >
        <ArrowLeft size={23} />
      </button>

      <h1>Cambiar de cuenta</h1>

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
            "Desde aquí puedes iniciar sesión con otra cuenta o crear una nueva cuenta en EsSalud Digital.",
          )
        }
      >
        <CircleHelp size={18} />
      </button>
    </header>
  );

  return (
    <main className="appointments-screen cambiar-cuenta-screen">
      {encabezado}

      <section className="cambiar-cuenta-content">
        <div className="cambiar-cuenta-intro">
          <h2>¿Qué deseas hacer?</h2>
          <p>Selecciona una opción para continuar en EsSalud Digital.</p>
        </div>

        <div className="cambiar-cuenta-options">
          <button
            type="button"
            className="cambiar-cuenta-option"
            onClick={() =>
              navigate("/essalud/login", {
                state: { cambiarCuenta: true },
              })
            }
          >
            <span className="cambiar-cuenta-option-icon">
              <LogIn size={24} />
            </span>

            <span className="cambiar-cuenta-option-text">
              <strong>Iniciar sesión en otra cuenta</strong>
              <small>
                Ingresa con el DNI y la contraseña de otro asegurado.
              </small>
            </span>

            <ChevronRight size={21} className="cambiar-cuenta-chevron" />
          </button>

          <button
            type="button"
            className="cambiar-cuenta-option"
            onClick={() =>
              navigate("/essalud/registro", {
                state: { agregarCuenta: true },
              })
            }
          >
            <span className="cambiar-cuenta-option-icon">
              <Plus size={25} />
            </span>

            <span className="cambiar-cuenta-option-text">
              <strong>Crear nueva cuenta</strong>
              <small>Regístrate para acceder a EsSalud Digital.</small>
            </span>

            <ChevronRight size={21} className="cambiar-cuenta-chevron" />
          </button>
        </div>

        <button
          type="button"
          className="cambiar-cuenta-return"
          onClick={() => navigate("/essalud/inicio")}
        >
          Volver al inicio
        </button>
      </section>
    </main>
  );
}
