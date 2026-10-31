
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  UserRound,
  ShieldCheck,
  IdCard,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

import {
  obtenerUsuarioActivo,
  actualizarDatosPersonales,
} from "../services/usuariosService.js";

export default function DatosPersonales() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  // Datos recuperados de la sesión del usuario.
  const nombre = usuario?.nombres || "No registrado";
  const documento = usuario?.dni || "No registrado";
  const nacimiento = usuario?.birthDate || "";
  const correo = usuario?.email || "No registrado";

  // Datos que el usuario puede actualizar.
  const [telefono, setTelefono] = useState(usuario?.phone || "");
  const [direccion, setDireccion] = useState(usuario?.direccion || "");

  // Estados de validación y mensajes.
  const [telefonoError, setTelefonoError] = useState("");
  const [direccionError, setDireccionError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);

  // Formatear fecha de nacimiento.
  const formatearFecha = (fecha) => {
    if (!fecha) return "No registrado";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) return fecha;

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Guardar los datos editados.
  const guardarCambios = (e) => {
    e.preventDefault();

    setTelefonoError("");
    setDireccionError("");
    setMensaje("");
    setGuardado(false);

    const telefonoLimpio = telefono.trim();
    const direccionLimpia = direccion.trim();

    let valido = true;

    if (!/^9\d{8}$/.test(telefonoLimpio)) {
      setTelefonoError(
        "Ingresa un celular válido de 9 dígitos que comience con 9."
      );
      valido = false;
    }

    if (direccionLimpia.length < 5) {
      setDireccionError("Ingresa una dirección válida.");
      valido = false;
    }

    if (!valido) return;

    const resultado = actualizarDatosPersonales({
      phone: telefonoLimpio,
      direccion: direccionLimpia,
    });

    setMensaje(resultado.mensaje);

    if (resultado.correcto) {
      setGuardado(true);
      setTelefono(resultado.usuario.phone || "");
      setDireccion(resultado.usuario.direccion || "");
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

    if (rutas[id]) navigate(rutas[id]);
  };

  return (
    <main className="appointments-screen datos-screen">

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

        <h1>Mis datos</h1>

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
              "Aquí puedes consultar tus datos personales y actualizar tu celular y dirección."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="datos-content">

        
        {/* INFORMACIÓN PERSONAL */}
        <section className="datos-heading">
          <h2>Información personal</h2>
          <p>Consulta los datos asociados a tu cuenta.</p>
        </section>

        <section className="datos-lista">

          <div className="datos-fila">
            <div className="datos-icono">
              <UserRound size={21} />
            </div>

            <div className="datos-texto">
              <span>Nombres y apellidos</span>
              <strong>{nombre}</strong>
            </div>

            <ShieldCheck className="datos-lock" size={17} />
          </div>

          <div className="datos-fila">
            <div className="datos-icono">
              <IdCard size={21} />
            </div>

            <div className="datos-texto">
              <span>Documento de identidad</span>
              <strong>{documento}</strong>
            </div>

            <ShieldCheck className="datos-lock" size={17} />
          </div>

          <div className="datos-fila">
            <div className="datos-icono">
              <CalendarDays size={21} />
            </div>

            <div className="datos-texto">
              <span>Fecha de nacimiento</span>
              <strong>{formatearFecha(nacimiento)}</strong>
            </div>

            <ShieldCheck className="datos-lock" size={17} />
          </div>

          <div className="datos-fila">
            <div className="datos-icono">
              <Mail size={21} />
            </div>

            <div className="datos-texto">
              <span>Correo electrónico</span>
              <strong>{correo}</strong>
            </div>

            <ShieldCheck className="datos-lock" size={17} />
          </div>

        </section>

        {/* DATOS EDITABLES */}
        <section className="datos-edit-section">

          <div className="datos-heading">
            <h2>Datos de contacto</h2>
            <p>
              Puedes actualizar esta información cuando lo necesites.
            </p>
          </div>

          <form onSubmit={guardarCambios}>

            {/* CELULAR */}
            <div className="datos-edit-card">

              <div className="datos-edit-label">
                <div className="datos-icono">
                  <Phone size={21} />
                </div>

                <div>
                  <label htmlFor="telefono">
                    Número de celular
                  </label>
                  <span>Actualiza tu número de contacto</span>
                </div>

                <Pencil size={16} />
              </div>

              <input
                id="telefono"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                placeholder="Ej. 987654321"
                value={telefono}
                onChange={(e) => {
                  setTelefono(
                    e.target.value.replace(/\D/g, "").slice(0, 9)
                  );
                  setTelefonoError("");
                  setMensaje("");
                  setGuardado(false);
                }}
                aria-invalid={Boolean(telefonoError)}
                aria-describedby={
                  telefonoError ? "telefono-error" : undefined
                }
              />

              {telefonoError && (
                <small id="telefono-error" className="datos-error">
                  {telefonoError}
                </small>
              )}

            </div>

            {/* DIRECCIÓN */}
            <div className="datos-edit-card">

              <div className="datos-edit-label">
                <div className="datos-icono">
                  <MapPin size={21} />
                </div>

                <div>
                  <label htmlFor="direccion">
                    Dirección
                  </label>
                  <span>Actualiza tu domicilio actual</span>
                </div>

                <Pencil size={16} />
              </div>

              <input
                id="direccion"
                type="text"
                placeholder="Ingresa tu dirección"
                value={direccion}
                onChange={(e) => {
                  setDireccion(e.target.value);
                  setDireccionError("");
                  setMensaje("");
                  setGuardado(false);
                }}
                aria-invalid={Boolean(direccionError)}
                aria-describedby={
                  direccionError ? "direccion-error" : undefined
                }
              />

              {direccionError && (
                <small id="direccion-error" className="datos-error">
                  {direccionError}
                </small>
              )}

            </div>

            {/* MENSAJE */}
            {mensaje && (
              <div
                className={`datos-mensaje ${
                  guardado
                    ? "datos-mensaje-exito"
                    : "datos-mensaje-error"
                }`}
                role="status"
              >
                {guardado ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}

                {mensaje}
              </div>
            )}

            {/* BOTÓN GUARDAR */}
            <button
              type="submit"
              className="datos-save-button"
            >
              <Save size={18} />
              Guardar cambios
            </button>

          </form>
        </section>

        {/* AVISO DE PRIVACIDAD */}
        <div className="datos-aviso">
          <ShieldCheck size={22} />

          <p>
            Tus datos personales están protegidos. Los datos de
            identificación se muestran únicamente para consulta.
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
