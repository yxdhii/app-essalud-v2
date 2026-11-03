
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  UserRound,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";

import essaludLogo from "../assets/digital-logo1.png";
import ConfirmacionModal from "../components/ConfirmacionModal";
import LoadingOverlay from "../components/LoadingOverlay";

import {
  iniciarSesionRecordada,
} from "../services/usuariosService.js";

export default function GestionarCuentas() {
  const navigate = useNavigate();

  const [cuentas, setCuentas] = useState([]);
  const [cuentaPorEliminar, setCuentaPorEliminar] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar cuentas guardadas
  useEffect(() => {
    try {
      const cuentasGuardadas = JSON.parse(
        localStorage.getItem("essalud_cuentas_agregadas") || "[]"
      );

      setCuentas(cuentasGuardadas);
    } catch (error) {
      console.error("Error al cargar las cuentas:", error);
      setCuentas([]);
    }
  }, []);

  // Bloquear el desplazamiento de la pantalla durante la carga
  useEffect(() => {
    if (!loading) return;

    const bloquearScroll = (e) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", bloquearScroll, {
      passive: false,
    });

    document.addEventListener("wheel", bloquearScroll, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", bloquearScroll);
      document.removeEventListener("wheel", bloquearScroll);
    };
  }, [loading]);

  // Ocultar DNI
  const formatearDni = (dni = "") => {
    const documento = String(dni);

    if (documento.length <= 2) return documento;

    return `${"•".repeat(documento.length - 2)}${documento.slice(-2)}`;
  };

  // Obtener iniciales
  const obtenerIniciales = (nombre = "") => {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Seleccionar una cuenta guardada
  const seleccionarCuenta = (cuenta) => {
    if (loading) return;

    // Acceso directo si la cuenta tiene acceso rápido activado
    if (cuenta.accesoRapido === true) {
      const resultado = iniciarSesionRecordada(cuenta.dni);

      if (resultado.correcto) {
        setLoading(true);

        setTimeout(() => {
          navigate("/essalud/inicio", {
            replace: true,
          });
        }, 1500);

        return;
      }
    }

    // Solicitar contraseña y permitir recordar nuevamente la cuenta
    navigate("/essalud/login", {
      state: {
        requierePassword: true,
        permitirRecordarCuenta: true,
        dni: cuenta.dni,
        nombre: cuenta.nombres || cuenta.name,
      },
    });
  };

  // Usar otro perfil
  const usarOtroPerfil = () => {
    if (loading) return;

    navigate("/essalud/login", {
      state: {
        cambiarCuenta: true,
      },
    });
  };

  // Crear cuenta nueva
  const crearCuentaNueva = () => {
    if (loading) return;

    navigate("/essalud/registro");
  };

  // Mostrar confirmación antes de eliminar
  const solicitarEliminarCuenta = (cuenta) => {
    if (loading) return;

    setCuentaPorEliminar(cuenta);
  };

  // Cancelar eliminación
  const cancelarEliminarCuenta = () => {
    setCuentaPorEliminar(null);
  };

  // Eliminar cuenta después de confirmar
  const confirmarEliminarCuenta = () => {
    if (!cuentaPorEliminar) return;

    const nuevasCuentas = cuentas.filter(
      (cuenta) =>
        String(cuenta.dni) !== String(cuentaPorEliminar.dni)
    );

    setCuentas(nuevasCuentas);

    localStorage.setItem(
      "essalud_cuentas_agregadas",
      JSON.stringify(nuevasCuentas)
    );

    setCuentaPorEliminar(null);
  };

  return (
    <main
      className={`essalud-login gestionar-cuentas-screen ${
        loading ? "gestionar-cuentas-loading" : ""
      }`}
      aria-busy={loading}
    >
      <div className="essalud-login-content">

        {/* ENCABEZADO */}
        <header className="essalud-login-header">
          <button
            type="button"
            className="essalud-back-button"
            onClick={() => navigate("/essalud/login")}
            aria-label="Volver al inicio de sesión"
            disabled={loading}
          >
            <ChevronLeft size={25} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="essalud-help-button"
            onClick={() =>
              window.alert(
                "Selecciona una cuenta guardada para iniciar sesión o utiliza otro perfil."
              )
            }
            disabled={loading}
          >
            <CircleHelp size={21} strokeWidth={2} />
            <span>Ayuda</span>
          </button>
        </header>

        {/* LOGO */}
        <div className="essalud-login-brand">
          <img src={essaludLogo} alt="EsSalud Digital" />
        </div>

        {/* TÍTULO */}
        <section className="gestionar-cuentas-heading">
          <h1>Gestionar cuentas</h1>
          <p>Selecciona una cuenta guardada para continuar.</p>
        </section>

        {/* LISTA DE CUENTAS */}
        <section className="gestionar-cuentas-list">
          {cuentas.length > 0 ? (
            cuentas.map((cuenta) => (
              <div
                className="gestionar-cuenta-card"
                key={cuenta.dni}
              >
                <button
                  type="button"
                  className="gestionar-cuenta-select"
                  onClick={() => seleccionarCuenta(cuenta)}
                  disabled={loading}
                >
                  <span
                    className="gestionar-cuenta-avatar"
                    style={{
                      backgroundColor: cuenta.color || "#EAF3FF",
                    }}
                  >
                    {cuenta.avatar || (
                      <span>
                        {obtenerIniciales(
                          cuenta.nombres || cuenta.name || "Usuario"
                        )}
                      </span>
                    )}
                  </span>

                  <span className="gestionar-cuenta-info">
                    <strong>
                      {cuenta.nombres || cuenta.name || "Titular"}
                    </strong>

                    <small>
                      DNI: {formatearDni(cuenta.dni)}
                    </small>

                    <span className="gestionar-cuenta-status">
                      <ShieldCheck size={14} />
                      Cuenta guardada
                    </span>
                  </span>

                  <ChevronRight
                    size={22}
                    className="gestionar-cuenta-arrow"
                  />
                </button>

                <button
                  type="button"
                  className="gestionar-cuenta-delete"
                  aria-label={`Eliminar cuenta de ${
                    cuenta.nombres || cuenta.name || "titular"
                  }`}
                  onClick={() => solicitarEliminarCuenta(cuenta)}
                  disabled={loading}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          ) : (
            <div className="gestionar-cuentas-empty">
              <UserRound size={42} strokeWidth={1.5} />

              <strong>No hay cuentas guardadas</strong>

              <p>
                Cuando recuerdes una cuenta al iniciar sesión,
                aparecerá aquí.
              </p>
            </div>
          )}
        </section>

        {/* USAR OTRO PERFIL */}
        <button
          type="button"
          className="gestionar-cuentas-other"
          onClick={usarOtroPerfil}
          disabled={loading}
        >
          <Plus size={21} />
          <span>Usar otro perfil</span>
        </button>

        {/* CREAR CUENTA NUEVA */}
        <button
          type="button"
          className="gestionar-cuentas-create"
          onClick={crearCuentaNueva}
          disabled={loading}
        >
          <UserPlus size={20} />
          <span>Crear cuenta nueva</span>
        </button>

        {/* INFORMACIÓN */}
        <div className="gestionar-cuentas-notice">
          <ShieldCheck size={21} />

          <p>
            Tus cuentas guardadas se mantienen en este dispositivo.
            Para acceder a ellas deberás autenticarte.
          </p>
        </div>

        {/* PIE */}
        <div className="gestionar-cuentas-footer">
          <p>EsSalud Digital</p>
          <span>Tu salud más cerca de ti</span>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <ConfirmacionModal
        isOpen={Boolean(cuentaPorEliminar)}
        title="¿Eliminar cuenta guardada?"
        message={
          cuentaPorEliminar
            ? `¿Estás segura de que deseas eliminar la cuenta de ${
                cuentaPorEliminar.nombres ||
                cuentaPorEliminar.name ||
                "este titular"
              } de este dispositivo?`
            : ""
        }
        onCancel={cancelarEliminarCuenta}
        onConfirm={confirmarEliminarCuenta}
        cancelText="No, conservar"
        confirmText="Sí, eliminar"
      />

      {/* PANTALLA DE CARGA */}
      {loading && (
        <LoadingOverlay message="Ingresando a tu cuenta..." />
      )}
    </main>
  );
}
