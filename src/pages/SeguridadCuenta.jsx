
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Info,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";

export default function SeguridadCuenta() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);

  // Validaciones en tiempo real.
  const cumpleLongitud = nuevaContrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(nuevaContrasena);
  const tieneNumero = /\d/.test(nuevaContrasena);

  // Limpiar mensajes al modificar los campos.
  const limpiarEstado = (campo, valor) => {
    setErrores((prev) => ({
      ...prev,
      [campo]: "",
    }));

    setMensaje("");
    setGuardado(false);
  };

  // Cambiar contraseña.
  const guardarCambios = (e) => {
    e.preventDefault();

    setErrores({});
    setMensaje("");
    setGuardado(false);

    const nuevosErrores = {};

    // Verificar campos obligatorios.
    if (!contrasenaActual.trim()) {
      nuevosErrores.actual = "Ingresa tu contraseña actual.";
    }

    if (!nuevaContrasena) {
      nuevosErrores.nueva = "Ingresa una nueva contraseña.";
    } else {
      if (nuevaContrasena.length < 8) {
        nuevosErrores.nueva = "Debe tener al menos 8 caracteres.";
      } else if (!/[A-Z]/.test(nuevaContrasena)) {
        nuevosErrores.nueva = "Incluye al menos una letra mayúscula.";
      } else if (!/\d/.test(nuevaContrasena)) {
        nuevosErrores.nueva = "Incluye al menos un número.";
      }
    }

    if (!confirmarContrasena) {
      nuevosErrores.confirmar = "Confirma tu nueva contraseña.";
    } else if (nuevaContrasena !== confirmarContrasena) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden.";
    }

    // Evitar reutilizar la contraseña actual.
    if (
      contrasenaActual &&
      nuevaContrasena &&
      nuevaContrasena === contrasenaActual
    ) {
      nuevosErrores.nueva =
        "La nueva contraseña debe ser diferente a la actual.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Verificar sesión activa.
    if (!usuario?.id) {
      setMensaje("No se encontró una sesión de usuario activa.");
      return;
    }

    try {
      // Obtener usuarios registrados.
      const usuarios = JSON.parse(
        localStorage.getItem("essalud_usuarios") || "[]"
      );

      // Buscar la cuenta del usuario actual.
      const usuarioRegistrado = usuarios.find(
        (item) => item.id === usuario.id
      );

      if (!usuarioRegistrado) {
        setMensaje("No se encontró tu cuenta registrada.");
        return;
      }

      // Comprobar contraseña actual.
      if (usuarioRegistrado.password !== contrasenaActual) {
        setErrores({
          actual: "La contraseña actual es incorrecta.",
        });
        return;
      }

      // Actualizar contraseña en localStorage.
      const usuariosActualizados = usuarios.map((item) =>
        item.id === usuario.id
          ? {
              ...item,
              password: nuevaContrasena,
            }
          : item
      );

      localStorage.setItem(
        "essalud_usuarios",
        JSON.stringify(usuariosActualizados)
      );

      // Limpiar formulario.
      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

      setMostrarActual(false);
      setMostrarNueva(false);
      setMostrarConfirmar(false);

      setErrores({});
      setGuardado(true);
      setMensaje("Tu contraseña se actualizó correctamente.");
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);

      setGuardado(false);
      setMensaje(
        "No se pudo actualizar tu contraseña. Inténtalo nuevamente."
      );
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
              "Desde esta sección puedes actualizar la contraseña de tu cuenta."
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
            <h2>Protege tu cuenta</h2>
            <p>
              Mantén tu información segura actualizando tu contraseña
              periódicamente.
            </p>
          </div>
        </section>

        {/* FORMULARIO */}

        <section className="seguridad-card">
          <div className="seguridad-heading">
            <div className="seguridad-heading-icon">
              <KeyRound size={21} />
            </div>

            <div>
              <h2>Cambiar contraseña</h2>
              <p>Completa los siguientes campos.</p>
            </div>
          </div>

          <form onSubmit={guardarCambios} noValidate>

            {/* CONTRASEÑA ACTUAL */}

            <div className="seguridad-field">
              <label htmlFor="contrasenaActual">
                Contraseña actual
              </label>

              <div
                className={`seguridad-input-wrapper ${
                  errores.actual ? "input-error" : ""
                }`}
              >
                <LockKeyhole size={19} />

                <input
                  id="contrasenaActual"
                  type={mostrarActual ? "text" : "password"}
                  placeholder="Ingresa tu contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => {
                    setContrasenaActual(e.target.value);
                    limpiarEstado("actual", e.target.value);
                  }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setMostrarActual(!mostrarActual)}
                  aria-label={
                    mostrarActual
                      ? "Ocultar contraseña actual"
                      : "Mostrar contraseña actual"
                  }
                >
                  {mostrarActual ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errores.actual && (
                <small className="seguridad-error">
                  <AlertCircle size={14} />
                  {errores.actual}
                </small>
              )}
            </div>

            {/* NUEVA CONTRASEÑA */}

            <div className="seguridad-field">
              <label htmlFor="nuevaContrasena">
                Nueva contraseña
              </label>

              <div
                className={`seguridad-input-wrapper ${
                  errores.nueva ? "input-error" : ""
                }`}
              >
                <LockKeyhole size={19} />

                <input
                  id="nuevaContrasena"
                  type={mostrarNueva ? "text" : "password"}
                  placeholder="Crea una nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => {
                    setNuevaContrasena(e.target.value);
                    limpiarEstado("nueva", e.target.value);
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setMostrarNueva(!mostrarNueva)}
                  aria-label={
                    mostrarNueva
                      ? "Ocultar nueva contraseña"
                      : "Mostrar nueva contraseña"
                  }
                >
                  {mostrarNueva ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errores.nueva && (
                <small className="seguridad-error">
                  <AlertCircle size={14} />
                  {errores.nueva}
                </small>
              )}

              {/* REQUISITOS */}

              <div className="seguridad-requisitos">
                <span className={cumpleLongitud ? "cumplido" : ""}>
                  <CheckCircle2 size={14} />
                  Mínimo 8 caracteres
                </span>

                <span className={tieneMayuscula ? "cumplido" : ""}>
                  <CheckCircle2 size={14} />
                  Una letra mayúscula
                </span>

                <span className={tieneNumero ? "cumplido" : ""}>
                  <CheckCircle2 size={14} />
                  Al menos un número
                </span>
              </div>
            </div>

            {/* CONFIRMAR CONTRASEÑA */}

            <div className="seguridad-field">
              <label htmlFor="confirmarContrasena">
                Confirmar nueva contraseña
              </label>

              <div
                className={`seguridad-input-wrapper ${
                  errores.confirmar ? "input-error" : ""
                }`}
              >
                <LockKeyhole size={19} />

                <input
                  id="confirmarContrasena"
                  type={mostrarConfirmar ? "text" : "password"}
                  placeholder="Vuelve a ingresar tu contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => {
                    setConfirmarContrasena(e.target.value);
                    limpiarEstado("confirmar", e.target.value);
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarConfirmar(!mostrarConfirmar)
                  }
                  aria-label={
                    mostrarConfirmar
                      ? "Ocultar confirmación"
                      : "Mostrar confirmación"
                  }
                >
                  {mostrarConfirmar ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errores.confirmar && (
                <small className="seguridad-error">
                  <AlertCircle size={14} />
                  {errores.confirmar}
                </small>
              )}
            </div>

            {/* MENSAJE DE RESULTADO */}

            {mensaje && (
              <div
                className={`seguridad-mensaje ${
                  guardado ? "mensaje-exito" : "mensaje-error"
                }`}
                role="status"
              >
                {guardado ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <AlertCircle size={19} />
                )}

                <span>{mensaje}</span>
              </div>
            )}

            {/* BOTÓN ACTUALIZAR */}

            <button
              type="submit"
              className="seguridad-save-button"
            >
              <Save size={18} />
              Actualizar contraseña
            </button>
          </form>
        </section>

        {/* RECOMENDACIÓN */}

        <div className="seguridad-info">
          <Info size={19} />

          <p>
            No compartas tu contraseña con otras personas. Utiliza
            una combinación segura y diferente a la de otras cuentas.
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
