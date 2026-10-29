import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HelpTutorial from "../components/HelpTutorial";
import BiometricModal from "../components/BiometricModal";
import { iniciarSesion } from "../services/usuariosService.js";
import { buscarAsegurado } from "../services/usuariosService.js";
import {

  ChevronLeft,
  CircleHelp,
  IdCard,
  LockKeyhole,
  Eye,
  EyeOff,
  ChevronRight,
  Fingerprint,
  ScanFace,
} from "lucide-react";

import essaludLogo from "../assets/digital-logo1.png";

function EsSaludLogin() {
  const navigate = useNavigate();

  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [biometricMethod, setBiometricMethod] = useState(null);

  // Determinar cuándo debe desenfocarse el contenido.
  const isOverlayOpen = showHelp || Boolean(biometricMethod);

  // Detener la pantalla de carga después de 2 segundos.
  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      setLoading(false);
      navigate("/essalud/inicio");
    }, 1500);

    return () => clearTimeout(timer);
  }, [loading, navigate]);
  // Validaciones.
  const dniError = !dni.trim()
    ? "El número de documento no puede estar vacío"
    : dni.length !== 8
      ? "El DNI debe contener 8 dígitos"
      : "";

  const passwordError = !password.trim()
    ? "La contraseña no puede estar vacía"
    : "";

  // Inicio de sesión.
  const handleLogin = (e) => {
    e.preventDefault();

    setSubmitted(true);
    setFormMessage("");

    if (dniError || passwordError) {
      return;
    }

    const resultado = iniciarSesion(dni, password);

    if (!resultado.correcto) {
      setFormMessage(resultado.mensaje);
      return;
    }

    setLoading(true);
  };

  // Cambiar DNI.
  const handleDniChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);

    setDni(value);
    setFormMessage("");
  };

  // Cambiar contraseña.
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormMessage("");
  };

  // Métodos biométricos.
  const handleBiometric = (method) => {
    setFormMessage("");
    setBiometricMethod(method);
  };

  const handleBiometricSuccess = () => {
    setBiometricMethod(null);

    // Cambia esta ruta por la ruta real de tu pantalla principal.
    navigate("/essalud/inicio");
  };

  return (
    <main
      className={`essalud-login ${isOverlayOpen ? "essalud-modal-open" : ""}`}
    >
      {/* CONTENIDO PRINCIPAL DEL INICIO DE SESIÓN */}
      <div className="essalud-login-content">
        {/* Barra superior */}
        <header className="essalud-login-header">
          <button
            type="button"
            className="essalud-back-button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ChevronLeft size={25} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="essalud-help-button"
            onClick={() => setShowHelp(true)}
          >
            <CircleHelp size={21} strokeWidth={2} />
            <span>Ayuda</span>
          </button>
        </header>

        {/* Logo */}
        <div className="essalud-login-brand">
          <img src={essaludLogo} alt="EsSalud Digital" />
        </div>

        {/* Título */}
        <section className="essalud-login-heading">
          <h1>Iniciar sesión</h1>
          <p>Ingresa tus datos para continuar</p>
        </section>

        {/* Formulario */}
        <form className="essalud-login-form" onSubmit={handleLogin} noValidate>
          {/* DNI */}
          <div
            data-tour="dni"
            className={`essalud-field-group ${
              submitted && dniError ? "has-error" : ""
            }`}
          >
            <label className="essalud-login-input">
              <IdCard size={27} strokeWidth={1.9} aria-hidden="true" />

              <span className="essalud-input-content">
                <span>Número de documento</span>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej. 12345678"
                  value={dni}
                  onChange={handleDniChange}
                  maxLength={8}
                  autoComplete="username"
                  aria-label="Número de documento"
                  aria-invalid={submitted && Boolean(dniError)}
                />
              </span>
            </label>

            {submitted && dniError && (
              <p className="essalud-field-error" role="alert">
                {dniError}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div
            data-tour="password"
            className={`essalud-field-group ${
              submitted && passwordError ? "has-error" : ""
            }`}
          >
            <label className="essalud-login-input">
              <LockKeyhole size={27} strokeWidth={1.9} aria-hidden="true" />

              <span className="essalud-input-content">
                <span>Contraseña</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  aria-label="Contraseña"
                  aria-invalid={submitted && Boolean(passwordError)}
                />
              </span>

              <button
                type="button"
                className="essalud-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.8} />
                ) : (
                  <Eye size={20} strokeWidth={1.8} />
                )}
              </button>
            </label>

            {submitted && passwordError && (
              <p className="essalud-field-error" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          {/* Recordar cuenta */}
          <div className="essalud-login-options">
            <label className="essalud-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Recordar mi cuenta</span>
            </label>

            <button
              data-tour="forgot"
              type="button"
              className="essalud-forgot-password"
              onClick={() =>
                setFormMessage(
                  "La recuperación de contraseña estará disponible próximamente.",
                )
              }
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Mensaje general */}
          {formMessage && (
            <p className="essalud-login-error" role="status">
              {formMessage}
            </p>
          )}

          {/* Botón ingresar */}
          <button
            type="submit"
            className="essalud-login-submit"
            disabled={loading}
          >
            <span>Ingresar</span>
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </form>

        {/* Separador */}
        <div className="essalud-login-divider">
          <span />
          <p>O continúa con</p>
          <span />
        </div>

        {/* Métodos biométricos */}
        <div className="essalud-login-biometric">
          <button type="button" onClick={() => handleBiometric("fingerprint")}>
            <Fingerprint size={27} strokeWidth={1.8} aria-hidden="true" />
            <span>Huella digital</span>
          </button>

          <button type="button" onClick={() => handleBiometric("face")}>
            <ScanFace size={27} strokeWidth={1.8} aria-hidden="true" />
            <span>Reconocimiento facial</span>
          </button>
        </div>

        {/* Crear cuenta */}
        <div className="essalud-login-register">
          <p>¿No tienes una cuenta?</p>

          <button
            data-tour="register"
            type="button"
            onClick={() => navigate("/essalud/registro")}
          >
            Crear cuenta
          </button>
        </div>

        {/* Pantalla de carga */}
        {loading && (
          <div className="essalud-loading-overlay">
            <div className="essalud-loading-content">
              <img
                src={essaludLogo}
                alt="EsSalud Digital"
                className="essalud-loading-logo"
              />

              <div
                className="essalud-loading-spinner"
                role="progressbar"
                aria-label="Validando tus datos"
              />

              <p className="essalud-loading-text">Validando tus datos...</p>
            </div>
          </div>
        )}
      </div>

      {/* TUTORIAL: FUERA DEL CONTENIDO QUE SE DESENFOCA */}
      <HelpTutorial isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* MODAL BIOMÉTRICO: FUERA DEL CONTENIDO QUE SE DESENFOCA */}
      {biometricMethod && (
        <BiometricModal
          method={biometricMethod}
          onSuccess={handleBiometricSuccess}
          onClose={() => setBiometricMethod(null)}
        />
      )}
    </main>
  );
}

export default EsSaludLogin;
