import { useState, useEffect, useCallback } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import HelpTutorial from "../components/HelpTutorial";
import BiometricModal from "../components/BiometricModal";
import LoadingOverlay from "../components/LoadingOverlay";

import {
  iniciarSesion,
  obtenerConfiguracionBiometrica,
} from "../services/usuariosService.js";

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
  const location = useLocation();

  // ============================================
  // ESTADO INICIAL
  // ============================================

  const requierePassword =
    location.state?.requierePassword === true;

  const permitirRecordarCuenta =
    location.state?.permitirRecordarCuenta === true;

  const nombreCuenta = location.state?.nombre || "";

  const [dni, setDni] = useState(
    location.state?.dni || ""
  );

  const [password, setPassword] = useState("");

  // Recordar cuenta también al ingresar desde Gestionar cuentas
  const [remember, setRemember] = useState(
    requierePassword
      ? permitirRecordarCuenta
      : true
  );

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [biometricMethod, setBiometricMethod] = useState(null);

  // Configuración biométrica de la cuenta
  const [biometria, setBiometria] = useState({
    fingerprint: false,
    face: false,
  });

  const isOverlayOpen =
    showHelp || Boolean(biometricMethod);

  // ============================================
  // CONSULTAR MÉTODOS BIOMÉTRICOS
  // ============================================

  useEffect(() => {
    if (dni.length !== 8) {
      setBiometria({
        fingerprint: false,
        face: false,
      });

      return;
    }

    const configuracion =
      obtenerConfiguracionBiometrica(dni);

    setBiometria(configuracion);
  }, [dni]);

  // ============================================
  // PANTALLA DE CARGA
  // ============================================

  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      navigate("/essalud/inicio", {
        replace: true,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [loading, navigate]);

  // ============================================
  // VALIDACIONES
  // ============================================

  const dniError = requierePassword
    ? ""
    : !dni.trim()
      ? "El número de documento no puede estar vacío"
      : dni.length !== 8
        ? "El DNI debe contener 8 dígitos"
        : "";

  const passwordError = !password.trim()
    ? "La contraseña no puede estar vacía"
    : "";

  // ============================================
  // INICIO DE SESIÓN TRADICIONAL
  // ============================================

  const handleLogin = (e) => {
    e.preventDefault();

    if (loading) return;

    setSubmitted(true);
    setFormMessage("");

    if (dniError || passwordError) {
      return;
    }

    // Enviar la preferencia seleccionada por el usuario
    const resultado = iniciarSesion(
      dni,
      password,
      remember
    );

    if (!resultado.correcto) {
      setFormMessage(resultado.mensaje);
      return;
    }

    setLoading(true);
  };

  // ============================================
  // CAMBIAR DNI
  // ============================================

  const handleDniChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 8);

    setDni(value);
    setFormMessage("");
    setSubmitted(false);
  };

  // ============================================
  // CAMBIAR CONTRASEÑA
  // ============================================

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormMessage("");
  };

  // ============================================
  // MÉTODOS BIOMÉTRICOS
  // ============================================

  const handleBiometric = (method) => {
    setFormMessage("");

    if (loading) return;

    if (!dni || dni.length !== 8) {
      setFormMessage(
        "Ingresa un DNI válido para continuar con la autenticación biométrica."
      );

      return;
    }

    if (!biometria[method]) {
      setFormMessage(
        "Este método biométrico no está habilitado. Ingresa con tu contraseña y actívalo desde Seguridad."
      );

      return;
    }

    setBiometricMethod(method);
  };

  // Se ejecuta cuando la verificación biométrica es correcta
  const handleBiometricSuccess = useCallback(() => {
    setBiometricMethod(null);
    setLoading(true);
  }, []);

  // ============================================
  // REGRESAR A GESTIONAR CUENTAS
  // ============================================

  const handleBack = () => {
    navigate("/essalud/gestionar-cuentas");
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <main
      className={`essalud-login ${
        isOverlayOpen ? "essalud-modal-open" : ""
      }`}
    >
      {/* CONTENIDO PRINCIPAL */}
      <div className="essalud-login-content">

        {/* BARRA SUPERIOR */}
        <header className="essalud-login-header">
          <button
            type="button"
            className="essalud-back-button"
            onClick={handleBack}
            aria-label="Volver a gestionar cuentas"
          >
            <ChevronLeft
              size={25}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            className="essalud-help-button"
            onClick={() => setShowHelp(true)}
          >
            <CircleHelp
              size={21}
              strokeWidth={2}
            />

            <span>Ayuda</span>
          </button>
        </header>

        {/* LOGO */}
        <div className="essalud-login-brand">
          <img
            src={essaludLogo}
            alt="EsSalud Digital"
          />
        </div>

        {/* TÍTULO */}
        <section className="essalud-login-heading">
          {requierePassword ? (
            <>
              <h1>
                ¡Hola
                {nombreCuenta
                  ? `, ${nombreCuenta.split(" ")[0]}`
                  : ""}!
              </h1>

              <p>
                Ingresa tu contraseña para continuar con tu cuenta.
              </p>
            </>
          ) : (
            <>
              <h1>Iniciar sesión</h1>
              <p>Ingresa tus datos para continuar</p>
            </>
          )}
        </section>

        {/* FORMULARIO */}
        <form
          className="essalud-login-form"
          onSubmit={handleLogin}
          noValidate
        >

          {/* DNI */}
          {!requierePassword && (
            <div
              data-tour="dni"
              className={`essalud-field-group ${
                submitted && dniError ? "has-error" : ""
              }`}
            >
              <label className="essalud-login-input">
                <IdCard
                  size={27}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />

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
                    aria-invalid={
                      submitted && Boolean(dniError)
                    }
                  />
                </span>
              </label>

              {submitted && dniError && (
                <p
                  className="essalud-field-error"
                  role="alert"
                >
                  {dniError}
                </p>
              )}
            </div>
          )}

          {/* DNI IDENTIFICADO */}
          {requierePassword && (
            <div className="essalud-login-identified">
              <IdCard
                size={21}
                strokeWidth={1.8}
              />

              <div>
                <span>Cuenta identificada</span>
                <strong>DNI: {dni}</strong>
              </div>
            </div>
          )}

          {/* CONTRASEÑA */}
          <div
            data-tour="password"
            className={`essalud-field-group ${
              submitted && passwordError ? "has-error" : ""
            }`}
          >
            <label className="essalud-login-input">
              <LockKeyhole
                size={27}
                strokeWidth={1.9}
                aria-hidden="true"
              />

              <span className="essalud-input-content">
                <span>Contraseña</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  aria-label="Contraseña"
                  aria-invalid={
                    submitted && Boolean(passwordError)
                  }
                />
              </span>

              <button
                type="button"
                className="essalud-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Eye
                    size={20}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </label>

            {submitted && passwordError && (
              <p
                className="essalud-field-error"
                role="alert"
              >
                {passwordError}
              </p>
            )}
          </div>

          {/* OPCIONES DE CUENTA */}
          <div className="essalud-login-options">

            {/* RECORDAR CUENTA */}
            {(!requierePassword || permitirRecordarCuenta) && (
              <label className="essalud-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                />

                <span>Recordar mi cuenta</span>
              </label>
            )}

            {/* OLVIDASTE TU CONTRASEÑA */}
            <button
              data-tour="forgot"
              type="button"
              className="essalud-forgot-password"
              onClick={() =>
                setFormMessage(
                  "La recuperación de contraseña estará disponible próximamente."
                )
              }
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* MENSAJE GENERAL */}
          {formMessage && (
            <p
              className="essalud-login-error"
              role="status"
            >
              {formMessage}
            </p>
          )}

          {/* BOTÓN INGRESAR */}
          <button
            type="submit"
            className="essalud-login-submit"
            disabled={loading}
          >
            <span>Ingresar</span>

            <ChevronRight
              size={22}
              strokeWidth={2.5}
            />
          </button>
        </form>

        {/* OPCIONES BIOMÉTRICAS */}
        <div className="essalud-login-divider">
          <span />
          <p>O continúa con</p>
          <span />
        </div>

        <div className="essalud-login-biometric">

          {/* HUELLA DIGITAL */}
          <button
            type="button"
            onClick={() => handleBiometric("fingerprint")}
            disabled={loading}
            className={
              biometria.fingerprint
                ? ""
                : "biometric-disabled"
            }
            aria-label="Ingresar con huella digital"
          >
            <Fingerprint
              size={27}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Huella digital</span>
          </button>

          {/* RECONOCIMIENTO FACIAL */}
          <button
            type="button"
            onClick={() => handleBiometric("face")}
            disabled={loading}
            className={
              biometria.face
                ? ""
                : "biometric-disabled"
            }
            aria-label="Ingresar con reconocimiento facial"
          >
            <ScanFace
              size={27}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>Reconocimiento facial</span>
          </button>
        </div>

        {/* CREAR CUENTA */}
        {!requierePassword && (
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
        )}

        {/* PANTALLA DE CARGA */}
        {loading && <LoadingOverlay />}
      </div>

      {/* TUTORIAL */}
      <HelpTutorial
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* MODAL BIOMÉTRICO */}
      {biometricMethod && (
        <BiometricModal
          method={biometricMethod}
          dni={dni}
          nombre={nombreCuenta}
          onSuccess={handleBiometricSuccess}
          onClose={() => setBiometricMethod(null)}
        />
      )}
    </main>
  );
}

export default EsSaludLogin;