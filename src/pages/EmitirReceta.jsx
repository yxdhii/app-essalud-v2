
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  FilePlus2,
  UserRound,
  Stethoscope,
  Plus,
  Trash2,
  Save,
  CircleHelp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { obtenerUsuarios } from "../services/usuariosService.js";
import { emitirReceta } from "../services/recetasService.js";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

export default function EmitirReceta() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener los usuarios registrados.
  const usuarios = obtenerUsuarios();

  // Recuperar el paciente enviado desde la pantalla Recetas.
  const pacienteInicial = location.state?.paciente || null;

  const [usuarioId, setUsuarioId] = useState(
    pacienteInicial?.id || ""
  );

  const [especialidad, setEspecialidad] = useState("");
  const [medico, setMedico] = useState("");

  // Obtener la fecha local.
  const obtenerFechaLocal = () => {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const [fecha, setFecha] = useState(obtenerFechaLocal());

  const [diagnostico, setDiagnostico] = useState("");
  const [indicaciones, setIndicaciones] = useState("");

  const [medicamentos, setMedicamentos] = useState([
    {
      nombre: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
    },
  ]);

  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);

  // Agregar un medicamento.
  const agregarMedicamento = () => {
    setMedicamentos((prev) => [
      ...prev,
      {
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
      },
    ]);
  };

  // Actualizar los campos de un medicamento.
  const actualizarMedicamento = (index, campo, valor) => {
    setMedicamentos((prev) =>
      prev.map((medicamento, i) =>
        i === index
          ? { ...medicamento, [campo]: valor }
          : medicamento
      )
    );
  };

  // Eliminar un medicamento.
  const eliminarMedicamento = (index) => {
    setMedicamentos((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Registrar la receta.
  const guardarReceta = (e) => {
    e.preventDefault();

    setMensaje("");
    setGuardado(false);

    // Validar que el paciente exista.
    const pacienteSeleccionado = usuarios.find(
      (usuario) => usuario.id === usuarioId
    );

    if (!pacienteSeleccionado) {
      setMensaje("Selecciona un paciente registrado.");
      return;
    }

    // Validar que la fecha no sea futura.
    if (fecha > obtenerFechaLocal()) {
      setMensaje("La fecha de emisión no puede ser futura.");
      return;
    }

    // Validar los datos de los medicamentos.
    const medicamentosValidos = medicamentos.every(
      (medicamento) =>
        medicamento.nombre.trim() &&
        medicamento.dosis.trim() &&
        medicamento.frecuencia.trim() &&
        medicamento.duracion.trim()
    );

    if (!medicamentosValidos) {
      setMensaje("Completa todos los campos de los medicamentos.");
      return;
    }

    // Guardar mediante el servicio.
    const resultado = emitirReceta({
      usuarioId,
      especialidad: especialidad.trim(),
      medico: medico.trim(),
      fecha,
      diagnostico: diagnostico.trim(),
      indicaciones: indicaciones.trim(),
      medicamentos: medicamentos.map((medicamento) => ({
        nombre: medicamento.nombre.trim(),
        dosis: medicamento.dosis.trim(),
        frecuencia: medicamento.frecuencia.trim(),
        duracion: medicamento.duracion.trim(),
      })),
    });

    setMensaje(resultado.mensaje);
    setGuardado(resultado.correcto);

    if (resultado.correcto) {
      setTimeout(() => {
        navigate("/essalud/recetas", {
          state: {
            paciente: pacienteSeleccionado,
          },
        });
      }, 900);
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

  // Regresar conservando el paciente.
  const volverRecetas = () => {
    navigate("/essalud/recetas", {
      state: pacienteInicial
        ? { paciente: pacienteInicial }
        : {},
    });
  };

  return (
    <main className="appointments-screen emitir-receta-screen">

      {/* ENCABEZADO */}

      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={volverRecetas}
          aria-label="Volver a recetas"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Emitir receta</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          type="button"
          className="reservar-help"
          onClick={() =>
            window.alert(
              "Formulario de simulación académica. No genera prescripciones médicas reales."
            )
          }
          aria-label="Ayuda"
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}

      <div className="emitir-receta-content">

        {/* PRESENTACIÓN */}

        <section className="emitir-receta-intro">
          <div className="emitir-receta-icon">
            <FilePlus2 size={27} />
          </div>

          <div>
            <h2>Registro de receta médica</h2>
            <p>
              Completa los datos de la atención y registra los medicamentos
              de esta simulación.
            </p>
          </div>
        </section>

        <form onSubmit={guardarReceta}>

          {/* DATOS DEL PACIENTE */}

          <section className="emitir-receta-card">
            <div className="emitir-receta-section-title">
              <UserRound size={20} />
              <h2>Datos del paciente</h2>
            </div>

            <label htmlFor="pacienteReceta">
              Seleccionar paciente
            </label>

            <select
              id="pacienteReceta"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              required
            >
              <option value="">
                Selecciona un paciente
              </option>

              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombres} - DNI {usuario.dni}
                </option>
              ))}
            </select>

            {pacienteInicial && (
              <small>
                Paciente recibido desde la pantalla de recetas.
              </small>
            )}
          </section>

          {/* DATOS DE LA ATENCIÓN */}

          <section className="emitir-receta-card">
            <div className="emitir-receta-section-title">
              <Stethoscope size={20} />
              <h2>Datos de la atención</h2>
            </div>

            <label htmlFor="especialidad">
              Especialidad
            </label>

            <input
              id="especialidad"
              type="text"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              placeholder="Ej. Medicina general"
              required
            />

            <label htmlFor="medico">
              Profesional de salud
            </label>

            <input
              id="medico"
              type="text"
              value={medico}
              onChange={(e) => setMedico(e.target.value)}
              placeholder="Nombre del profesional"
              required
            />

            <label htmlFor="fechaReceta">
              Fecha de emisión
            </label>

            <input
              id="fechaReceta"
              type="date"
              value={fecha}
              max={obtenerFechaLocal()}
              onChange={(e) => setFecha(e.target.value)}
              required
            />

            <label htmlFor="diagnostico">
              Diagnóstico (simulado)
            </label>

            <textarea
              id="diagnostico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Descripción del diagnóstico de prueba"
              rows={3}
            />
          </section>

          {/* MEDICAMENTOS */}

          <section className="emitir-receta-card">
            <div className="emitir-receta-section-title">
              <FilePlus2 size={20} />
              <h2>Medicamentos</h2>
            </div>

            {medicamentos.map((medicamento, index) => (
              <div
                className="medicamento-form-card"
                key={index}
              >
                <div className="medicamento-form-heading">
                  <strong>
                    Medicamento {index + 1}
                  </strong>

                  {medicamentos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarMedicamento(index)}
                      aria-label={`Eliminar medicamento ${index + 1}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <label htmlFor={`nombre-${index}`}>
                  Nombre del medicamento
                </label>

                <input
                  id={`nombre-${index}`}
                  type="text"
                  value={medicamento.nombre}
                  onChange={(e) =>
                    actualizarMedicamento(
                      index,
                      "nombre",
                      e.target.value
                    )
                  }
                  placeholder="Nombre para la simulación"
                  required
                />

                <label htmlFor={`dosis-${index}`}>
                  Dosis
                </label>

                <input
                  id={`dosis-${index}`}
                  type="text"
                  value={medicamento.dosis}
                  onChange={(e) =>
                    actualizarMedicamento(
                      index,
                      "dosis",
                      e.target.value
                    )
                  }
                  placeholder="Ej. 1 unidad"
                  required
                />

                <label htmlFor={`frecuencia-${index}`}>
                  Frecuencia
                </label>

                <input
                  id={`frecuencia-${index}`}
                  type="text"
                  value={medicamento.frecuencia}
                  onChange={(e) =>
                    actualizarMedicamento(
                      index,
                      "frecuencia",
                      e.target.value
                    )
                  }
                  placeholder="Ej. Según indicación simulada"
                  required
                />

                <label htmlFor={`duracion-${index}`}>
                  Duración
                </label>

                <input
                  id={`duracion-${index}`}
                  type="text"
                  value={medicamento.duracion}
                  onChange={(e) =>
                    actualizarMedicamento(
                      index,
                      "duracion",
                      e.target.value
                    )
                  }
                  placeholder="Ej. 3 días"
                  required
                />
              </div>
            ))}

            <button
              type="button"
              className="agregar-medicamento-button"
              onClick={agregarMedicamento}
            >
              <Plus size={18} />
              Agregar medicamento
            </button>

            <label htmlFor="indicaciones">
              Indicaciones adicionales
            </label>

            <textarea
              id="indicaciones"
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
              placeholder="Observaciones de la simulación"
              rows={3}
            />
          </section>

          {/* MENSAJE DE RESULTADO */}

          {mensaje && (
            <div
              className={`emitir-receta-message ${
                guardado ? "success" : "error"
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

          {/* AVISO */}

          <div className="emitir-receta-disclaimer">
            <AlertCircle size={18} />

            <p>
              Entorno de demostración: los datos y medicamentos registrados
              son ficticios y no constituyen una prescripción médica real.
            </p>
          </div>

          {/* BOTÓN GUARDAR */}

          <button
            type="submit"
            className="emitir-receta-save"
            disabled={guardado}
          >
            <Save size={18} />
            Registrar receta de prueba
          </button>

        </form>
      </div>

      {/* NAVEGACIÓN INFERIOR */}

      <BottomNavigation
        active="perfil"
        onNavigate={navegarMenu}
      />

    </main>
  );
}
