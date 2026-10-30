import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRoundPlus,
  CreditCard,
  UsersRound,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import { vincularFamiliar } from "../services/usuariosService.js";

export default function AgregarFamiliar() {
  const navigate = useNavigate();

  const [dni, setDni] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [correcto, setCorrecto] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setMensaje("");
    setCorrecto(false);

    if (!/^\d{8}$/.test(dni)) {
      setMensaje("Ingresa un DNI válido de 8 dígitos.");
      return;
    }

    if (!parentesco) {
      setMensaje("Selecciona el parentesco del familiar.");
      return;
    }

    setCargando(true);

    try {
      const resultado = vincularFamiliar(dni, parentesco);

      setMensaje(resultado.mensaje);
      setCorrecto(resultado.correcto);

      if (resultado.correcto) {
        setDni("");
        setParentesco("");
      }
    } catch {
      setMensaje("Ocurrió un error al vincular al familiar.");
      setCorrecto(false);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="appointments-screen agregar-familiar-page">
      {/* ENCABEZADO REUTILIZADO DE MIS CITAS */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/inicio")}
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Agregar familiar</h1>

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
              "Ingresa el DNI y el parentesco para vincular a un familiar.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO DEL FORMULARIO */}
      <section className="agregar-familiar-content">
        <div className="agregar-familiar-intro">
          <div className="agregar-familiar-icon">
            <UserRoundPlus size={32} />
          </div>

          <h2>Vincula a un familiar</h2>

          <p>
            Ingresa los datos de un asegurado para asociarlo a tu perfil y
            facilitar la gestión de su atención médica.
          </p>
        </div>

        <form className="agregar-familiar-form" onSubmit={handleSubmit}>
          <label htmlFor="dni-familiar">DNI del familiar</label>

          <div className="agregar-familiar-input">
            <CreditCard size={20} />

            <input
              id="dni-familiar"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ingresa los 8 dígitos"
              value={dni}
              onChange={(event) => {
                setDni(event.target.value.replace(/\D/g, "").slice(0, 8));
                setMensaje("");
              }}
              maxLength={8}
              required
            />
          </div>

          <label htmlFor="parentesco-familiar">Parentesco</label>

          <div className="agregar-familiar-input">
            <UsersRound size={20} />

            <select
              id="parentesco-familiar"
              value={parentesco}
              onChange={(event) => {
                setParentesco(event.target.value);
                setMensaje("");
              }}
              required
            >
              <option value="">Selecciona el parentesco</option>
              <option value="Cónyuge">Cónyuge</option>
              <option value="Hijo">Hijo/a</option>
              <option value="Padre">Padre</option>
              <option value="Madre">Madre</option>
              <option value="Hermano">Hermano/a</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {mensaje && (
            <div
              className={`agregar-familiar-message ${
                correcto ? "success" : "error"
              }`}
              role="status"
              aria-live="polite"
            >
              {correcto ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}

              <span>{mensaje}</span>
            </div>
          )}

          <button
            type="submit"
            className="agregar-familiar-submit"
            disabled={cargando}
          >
            {cargando ? "Vinculando..." : "Vincular familiar"}
          </button>

          <button
            type="button"
            className="agregar-familiar-cancel"
            onClick={() => navigate("/essalud/inicio")}
          >
            Cancelar
          </button>
        </form>

        <div className="agregar-familiar-notice">
          <AlertCircle size={19} />

          <p>
            Recuerda que el DNI debe corresponder a un asegurado incluido en los
            datos de prueba de la aplicación.
          </p>
        </div>
      </section>
    </main>
  );
}
