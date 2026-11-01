
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  ShieldCheck,
  Fingerprint,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

import {
  obtenerUsuarioActivo,
  obtenerConfiguracionBiometrica,
  habilitarBiometriaSimulada,
  deshabilitarBiometriaSimulada,
} from "../services/usuariosService.js";

export default function BiometriaCuenta() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const [biometria, setBiometria] = useState({
    fingerprint: false,
    face: false,
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // Cargar configuración biométrica de la cuenta.
  useEffect(() => {
    if (usuario?.dni) {
      const configuracion = obtenerConfiguracionBiometrica(
        usuario.dni
      );

      setBiometria(configuracion);
    }
  }, [usuario?.dni]);

  // Activar o desactivar un método biométrico.
  const cambiarBiometria = (metodo) => {
    setMensaje("");

    if (!usuario?.dni) {
      setError(true);
      setMensaje("No se encontró una sesión activa.");
      return;
    }

    const estaActivo = biometria[metodo];

    const resultado = estaActivo
      ? deshabilitarBiometriaSimulada(usuario.dni, metodo)
      : habilitarBiometriaSimulada(usuario.dni, metodo);

    setError(!resultado.correcto);
    setMensaje(resultado.mensaje);

    if (resultado.correcto) {
      setBiometria((prev) => ({
        ...prev,
        [metodo]: !estaActivo,
      }));
    }
  };

  // Navegación inferior.
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

  return (
    <main className="appointments-screen seguridad-screen">

      {/* ENCABEZADO */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/seguridad")}
          aria-label="Volver a seguridad"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Autenticación biométrica</h1>

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
              "Desde esta sección puedes configurar tus métodos de autenticación biométrica."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="seguridad-content">

        {/* PRESENTACIÓN */}
        <section className="seguridad-intro">
          <div className="seguridad-intro-icon">
            <ShieldCheck size={31} />
          </div>

          <div>
            <h2>Acceso seguro y rápido</h2>
            <p>
              Configura tus métodos biométricos para acceder
              a tu cuenta de manera sencilla y segura.
            </p>
          </div>
        </section>

        {/* MÉTODOS BIOMÉTRICOS */}
        <section className="seguridad-card">

          <div className="seguridad-heading">
            <div className="seguridad-heading-icon">
              <Fingerprint size={21} />
            </div>

            <div>
              <h2>Métodos biométricos</h2>
              <p>
                Selecciona los métodos que deseas habilitar.
              </p>
            </div>
          </div>

          {/* HUELLA DIGITAL */}
          <div className="biometria-option">
            <div className="biometria-option-icon">
              <Fingerprint size={28} />
            </div>

            <div className="biometria-option-info">
              <h3>Huella digital</h3>

              <p>
                Utiliza tu huella digital para identificarte
                al iniciar sesión.
              </p>

              <span
                className={
                  biometria.fingerprint
                    ? "biometria-status activo"
                    : "biometria-status inactivo"
                }
              >
                {biometria.fingerprint
                  ? "Activada"
                  : "Desactivada"}
              </span>
            </div>

            <button
              type="button"
              className={
                biometria.fingerprint
                  ? "biometria-button desactivar"
                  : "biometria-button"
              }
              onClick={() =>
                cambiarBiometria("fingerprint")
              }
            >
              {biometria.fingerprint
                ? "Desactivar"
                : "Activar"}
            </button>
          </div>

          {/* RECONOCIMIENTO FACIAL */}
          <div className="biometria-option">
            <div className="biometria-option-icon">
              <ScanFace size={28} />
            </div>

            <div className="biometria-option-info">
              <h3>Reconocimiento facial</h3>

              <p>
                Utiliza el reconocimiento facial para
                identificarte al iniciar sesión.
              </p>

              <span
                className={
                  biometria.face
                    ? "biometria-status activo"
                    : "biometria-status inactivo"
                }
              >
                {biometria.face
                  ? "Activado"
                  : "Desactivado"}
              </span>
            </div>

            <button
              type="button"
              className={
                biometria.face
                  ? "biometria-button desactivar"
                  : "biometria-button"
              }
              onClick={() => cambiarBiometria("face")}
            >
              {biometria.face
                ? "Desactivar"
                : "Activar"}
            </button>
          </div>

          {/* MENSAJE DE RESULTADO */}
          {mensaje && (
            <div
              className={`seguridad-mensaje ${
                error ? "mensaje-error" : "mensaje-exito"
              }`}
              role="status"
            >
              {error ? (
                <AlertCircle size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}

              <span>{mensaje}</span>
            </div>
          )}
        </section>

        {/* RECOMENDACIÓN */}
        <div className="seguridad-info">
          <Info size={19} />

          <p>
            Puedes activar uno o ambos métodos biométricos.
          </p>
        </div>

      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation
        active="perfil"
        onNavigate={navegarMenu}
      />

    </main>
  );
}
