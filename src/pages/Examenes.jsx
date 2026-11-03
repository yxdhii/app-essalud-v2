
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  FlaskConical,
  FileText,
  CalendarDays,
  Download,
  UserRound,
  ChevronRight,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";

import logoEssalud from "../assets/digital-logo.png";
import emptyExams from "../assets/empty-exams.png";

import {
  obtenerUsuarioActivo,
  obtenerFamiliaresVinculados,
} from "../services/usuariosService.js";

import {
  obtenerExamenesPaciente,
} from "../services/examenesService.js";

import { usePaciente } from "../context/PacienteContext";

export default function Examenes() {
  const navigate = useNavigate();

  // Cuenta autenticada.
  const usuario = obtenerUsuarioActivo();

  // Contexto global del paciente.
  const { pacienteSeleccionado } = usePaciente();

  // Familiares vinculados al titular.
  const familiares = usuario
    ? obtenerFamiliaresVinculados(usuario.dni) || []
    : [];

  const pacientesDisponibles = [
    usuario,
    ...familiares,
  ].filter(
    (item, index, lista) =>
      item?.dni &&
      lista.findIndex(
        (persona) =>
          String(persona?.dni) === String(item.dni)
      ) === index
  );

  // Validar que el perfil seleccionado esté vinculado
  // a la cuenta autenticada.
  const pacienteAutorizado = pacienteSeleccionado?.dni
    ? pacientesDisponibles.find(
        (item) =>
          String(item.dni) ===
          String(pacienteSeleccionado.dni)
      )
    : null;

  // Paciente que se está consultando.
  const pacienteActual = pacienteAutorizado || usuario;

  const pacienteId = pacienteActual?.dni || null;

  const [activeTab, setActiveTab] = useState("actual");
  const [examenes, setExamenes] = useState([]);

  // Cargar exclusivamente los exámenes del paciente activo.
  const cargarExamenes = () => {
    if (!usuario || !pacienteId) {
      setExamenes([]);
      return;
    }

    const datos = obtenerExamenesPaciente(pacienteId);

    setExamenes(datos);
  };

  useEffect(() => {
    if (!usuario) {
      navigate("/essalud");
      return;
    }

    cargarExamenes();
  }, [usuario?.id, pacienteId]);

  // Filtrar por periodo.
  const examenesFiltrados = examenes.filter((examen) => {
    const periodoCalculado =
      examen.periodo ||
      "actual";

    return periodoCalculado === activeTab;
  });

  // Navegación inferior.
  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") navigate("/essalud/citas");
    if (id === "recetas") navigate("/essalud/recetas");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  // Formatear fecha.
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) {
      return fecha;
    }

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Nombre del paciente.
  const nombrePaciente =
    pacienteActual?.nombres ||
    pacienteActual?.nombre ||
    "Paciente";

  // Nombre que se muestra en las tarjetas.
  const obtenerNombrePacienteExamen = (examen) => {
    const nombre =
      examen.pacienteNombre ||
      examen.paciente;

    if (
      nombre &&
      String(nombre).trim().toLowerCase() !== "paciente"
    ) {
      return nombre;
    }

    return nombrePaciente;
  };

  // Abrir detalle conservando el paciente activo.
  const verDetalle = (examen) => {
    navigate(`/essalud/examen/${examen.id}`, {
      state: {
        examen,
        paciente: pacienteActual,
      },
    });
  };

  // Textos de pantalla vacía.
  const tituloVacio =
    activeTab === "anteriores"
      ? "No tienes exámenes anteriores"
      : activeTab === "actual"
        ? "¡Aún no tienes exámenes médicos!"
        : "No tienes exámenes próximos";

  const mensajeVacio =
    activeTab === "anteriores"
      ? `Aquí aparecerán los exámenes que ${nombrePaciente} se haya realizado anteriormente.`
      : activeTab === "actual"
        ? `Aquí aparecerán los exámenes médicos de ${nombrePaciente} y podrás consultar sus resultados cuando estén disponibles.`
        : `Cuando ${nombrePaciente} tenga exámenes programados para este periodo, aparecerán aquí.`;

  if (!usuario) {
    return (
      <main className="appointments-screen prescriptions-page examenes-page">
        <section className="prescriptions-empty">
          <UserRound size={42} />
          <h2>Inicia sesión</h2>
          <p>Necesitas iniciar sesión para consultar tus exámenes.</p>
          <button
            type="button"
            onClick={() => navigate("/essalud")}
          >
            Volver
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="appointments-screen prescriptions-page examenes-page">

      {/* ENCABEZADO */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/inicio")}
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Exámenes</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          type="button"
          className="reservar-help"
          aria-label="Ayuda"
          onClick={() =>
            window.alert(
              "Aquí puedes consultar tus exámenes médicos y revisar los resultados cuando estén disponibles."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* PESTAÑAS */}
      <div
        className="appointments-tabs"
        role="tablist"
        aria-label="Periodo de exámenes"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "anteriores"}
          className={activeTab === "anteriores" ? "active" : ""}
          onClick={() => setActiveTab("anteriores")}
        >
          Anteriores
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "actual"}
          className={activeTab === "actual" ? "active" : ""}
          onClick={() => setActiveTab("actual")}
        >
          Mes actual
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "siguientes"}
          className={activeTab === "siguientes" ? "active" : ""}
          onClick={() => setActiveTab("siguientes")}
        >
          Siguientes
        </button>
      </div>

      {/* PACIENTE ACTUAL */}
      <div className="prescriptions-patient">
        <UserRound size={17} />

        <span>
          Exámenes de{" "}
          <strong>{nombrePaciente}</strong>
        </span>
      </div>

      {/* CONTENIDO */}
      <div className="prescriptions-content examenes-content">
        {examenesFiltrados.length === 0 ? (
          <section className="prescriptions-empty examenes-empty">
            <div className="examenes-empty-main">
              <img
                src={emptyExams}
                alt="Doctora mostrando información médica y exámenes de laboratorio"
                className="examenes-empty-image"
              />

              <h2>{tituloVacio}</h2>

              <p className="prescriptions-empty-description">
                {mensajeVacio}
              </p>
            </div>

            {/* INFORMACIÓN INFERIOR */}
            <section
              className="prescriptions-info-banner"
              aria-labelledby="examenes-info-title"
            >
              <div className="prescriptions-info-icon">
                <FileText size={23} />
              </div>

              <div className="prescriptions-info-text">
                <h3 id="examenes-info-title">
                  ¿Cómo consultar tus resultados?
                </h3>

                <p>
                  Consulta tus resultados aquí cuando el establecimiento
                  de salud los registre.
                </p>
              </div>
            </section>
          </section>
        ) : (
          <section className="appointments-section">
            <div className="appointments-section-title">
              <h2>
                {activeTab === "anteriores"
                  ? "Exámenes anteriores"
                  : activeTab === "actual"
                    ? "Exámenes médicos"
                    : "Próximos exámenes"}
              </h2>

              <span>{examenesFiltrados.length}</span>
            </div>

            {examenesFiltrados.map((examen) => (
              <article
                className="examen-card"
                key={examen.id}
              >
                <div className="examen-card-heading">
                  <span className="examen-icon">
                    <FlaskConical size={23} />
                  </span>

                  <div className="examen-card-heading-text">
                    <h3>{examen.nombre}</h3>

                    <p>
                      {examen.laboratorio ||
                        "Establecimiento de salud"}
                    </p>
                  </div>
                </div>

                {/* PACIENTE */}
                <div className="examen-details">
                  <UserRound size={17} />

                  <span>
                    Paciente:{" "}
                    <strong>
                      {obtenerNombrePacienteExamen(examen)}
                    </strong>
                  </span>
                </div>

                {/* PERSONA QUE GESTIONÓ */}
                {examen.solicitanteNombre && (
                  <div className="examen-details">
                    <UserRound size={17} />

                    <span>
                      Gestionado por:{" "}
                      <strong>{examen.solicitanteNombre}</strong>
                    </span>
                  </div>
                )}

                <div className="examen-details">
                  <CalendarDays size={17} />
                  <span>{formatearFecha(examen.fecha)}</span>
                </div>

                <span
                  className={`examen-status ${
                    examen.estado?.toLowerCase() === "disponible" ||
                    examen.estado?.toLowerCase() === "completado"
                      ? "disponible"
                      : "pendiente"
                  }`}
                >
                  {examen.estado?.toLowerCase() === "disponible" ||
                  examen.estado?.toLowerCase() === "completado"
                    ? "Resultado disponible"
                    : "Pendiente"}
                </span>

                <div className="examen-actions">
                  {(examen.estado?.toLowerCase() === "disponible" ||
                    examen.estado?.toLowerCase() === "completado") &&
                    examen.archivoUrl && (
                      <a
                        href={examen.archivoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download size={17} />
                        Descargar PDF
                      </a>
                    )}

                  {(examen.estado?.toLowerCase() === "disponible" ||
                    examen.estado?.toLowerCase() === "completado") &&
                    examen.resultadoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            examen.resultadoUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <FileText size={17} />
                        Ver resultados
                      </button>
                    )}
                </div>

                <button
                  type="button"
                  className="prescription-details-button"
                  onClick={() => verDetalle(examen)}
                >
                  Ver detalles
                  <ChevronRight size={18} />
                </button>
              </article>
            ))}
          </section>
        )}
      </div>

    </main>
  );
}
