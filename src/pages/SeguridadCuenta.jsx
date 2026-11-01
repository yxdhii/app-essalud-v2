import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  ChevronRight,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

export default function SeguridadCuenta() {
  const navigate = useNavigate();

  const navegarMenu = (id) => {
    const rutas = {
      inicio: "/essalud/inicio",
      citas: "/essalud/citas",
      chat: "/essalud/chat",
      perfil: "/essalud/perfil",
    };

    if (rutas[id]) navigate(rutas[id]);
  };

  return (
    <main className="appointments-screen seguridad-screen">
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/perfil")}
          aria-label="Volver a mi perfil"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Seguridad</h1>

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
              "Selecciona una opción para administrar la seguridad de tu cuenta."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      <div className="seguridad-content">
        <section className="seguridad-intro">
          <div className="seguridad-intro-icon">
            <ShieldCheck size={31} />
          </div>

          <div>
            <h2>Protege tu cuenta</h2>
            <p>
              Administra tus métodos de seguridad y protege
              tu información personal.
            </p>
          </div>
        </section>

        <section className="seguridad-menu">
          <h2>Opciones de seguridad</h2>
          <p>¿Qué deseas configurar?</p>

          <button
            type="button"
            className="seguridad-menu-option"
            onClick={() =>
              navigate("/essalud/seguridad/contrasena")
            }
          >
            <div className="seguridad-menu-icon">
              <KeyRound size={24} />
            </div>

            <div className="seguridad-menu-text">
              <h3>Cambiar contraseña</h3>
              <p>
                Actualiza tu contraseña de acceso.
              </p>
            </div>

            <ChevronRight size={22} />
          </button>

          <button
            type="button"
            className="seguridad-menu-option"
            onClick={() =>
              navigate("/essalud/seguridad/biometria")
            }
          >
            <div className="seguridad-menu-icon">
              <Fingerprint size={25} />
            </div>

            <div className="seguridad-menu-text">
              <h3>Autenticación biométrica</h3>
              <p>
                Configura tu huella digital o reconocimiento facial.
              </p>
            </div>

            <ChevronRight size={22} />
          </button>
        </section>
      </div>

      <BottomNavigation
        active="perfil"
        onNavigate={navegarMenu}
      />
    </main>
  );
}