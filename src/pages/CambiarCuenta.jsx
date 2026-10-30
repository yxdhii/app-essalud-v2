import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { asegurados } from "../data/asegurados.js";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  CircleHelp,
  UserRound,
  Check,
  ShieldCheck,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import { obtenerUsuarioActivo } from "../services/usuariosService.js";

export default function CambiarCuenta() {
  const navigate = useNavigate();

  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
    const usuario = obtenerUsuarioActivo();
    setUsuarioActivo(usuario);

    try {
      const cuentasGuardadas = JSON.parse(
        localStorage.getItem("essalud_cuentas_agregadas") || "[]",
      );

      const todasLasCuentas = cuentasGuardadas.map((cuenta) => {
        const asegurado = asegurados.find(
          (item) => String(item.dni) === String(cuenta.dni),
        );

        const esUsuarioActivo =
          usuario && String(cuenta.dni) === String(usuario.dni);

        return {
          ...cuenta,
          avatar:
            cuenta.avatar ||
            asegurado?.avatar ||
            (esUsuarioActivo ? usuario.avatar : null),
          sexo: cuenta.sexo || asegurado?.sexo || null,
        };
      });

      // Añadir al usuario activo si todavía no está guardado.
      if (
        usuario &&
        !todasLasCuentas.some(
          (cuenta) => String(cuenta.dni) === String(usuario.dni),
        )
      ) {
        const aseguradoActivo = asegurados.find(
          (item) => String(item.dni) === String(usuario.dni),
        );

        todasLasCuentas.unshift({
          ...usuario,
          avatar: usuario.avatar || aseguradoActivo?.avatar || null,
        });
      }

      setCuentas(todasLasCuentas);
    } catch (error) {
      console.error("Error al cargar las cuentas guardadas:", error);
      setCuentas(usuario ? [usuario] : []);
    }
  }, []);

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
            "Selecciona una cuenta guardada o agrega otra cuenta para continuar.",
          )
        }
      >
        <CircleHelp size={18} />
      </button>
    </header>
  );

  const obtenerIniciales = (nombre = "") => {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatearDni = (dni = "") => {
    const documento = String(dni);

    if (documento.length <= 2) {
      return documento;
    }

    return `${"•".repeat(documento.length - 2)}${documento.slice(-2)}`;
  };

  const agregarCuenta = () => {
    navigate("/essalud/login", {
      state: { cambiarCuenta: true },
    });
  };

  return (
    <main className="appointments-screen cambiar-cuenta-screen">
      {encabezado}

      <section className="cambiar-cuenta-content">
        <div className="cambiar-cuenta-intro">
          <h2>Tus cuentas</h2>
          <p>Selecciona una cuenta para continuar.</p>
        </div>

        <div className="cambiar-cuenta-list">
          {cuentas.map((cuenta) => {
            const esActiva =
              usuarioActivo && String(cuenta.dni) === String(usuarioActivo.dni);

            return (
              <button
                type="button"
                key={cuenta.dni}
                className={`cuenta-guardada ${
                  esActiva ? "cuenta-guardada-activa" : ""
                }`}
                onClick={() => {
                  if (esActiva) {
                    navigate("/essalud/inicio");
                  } else {
                    window.alert(
                      "El cambio de cuenta estará disponible cuando conectemos esta tarjeta con el servicio de cuentas guardadas.",
                    );
                  }
                }}
                aria-current={esActiva ? "true" : undefined}
              >
                <span
                  className="cuenta-avatar"
                  style={{
                    backgroundColor: cuenta.color || "#EAF4FF",
                  }}
                >
                  <span className="cuenta-avatar-inner">
                    {cuenta.avatar || <UserRound size={28} strokeWidth={1.8} />}
                  </span>
                </span>

                <span className="cuenta-guardada-info">
                  <strong>{cuenta.nombres || cuenta.name || "Usuario"}</strong>

                  {esActiva && (
                    <span className="cuenta-activa-badge">
                      <Check size={13} />
                      Cuenta activa
                    </span>
                  )}

                  <small>DNI: {formatearDni(cuenta.dni)}</small>
                </span>

                {esActiva ? (
                  <span className="cuenta-check">
                    <Check size={19} strokeWidth={3} />
                  </span>
                ) : (
                  <ChevronRight size={22} className="cuenta-chevron" />
                )}
              </button>
            );
          })}

          {cuentas.length === 0 && (
            <div className="cuentas-vacias">
              <UserRound size={30} />
              <strong>No hay cuentas guardadas</strong>
              <p>Inicia sesión para agregar tu primera cuenta.</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="cambiar-cuenta-add"
          onClick={agregarCuenta}
        >
          <span className="cambiar-cuenta-add-icon">
            <Plus size={24} />
          </span>
          <span>Agregar otra cuenta</span>
        </button>

        <div className="cambiar-cuenta-notice">
          <span className="cambiar-cuenta-notice-icon">
            <ShieldCheck size={24} />
          </span>

          <p>Tus cuentas guardadas se mantienen en este dispositivo.</p>
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
