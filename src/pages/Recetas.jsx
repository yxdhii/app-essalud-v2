
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  FileText,
  Download,
  CalendarDays,
  UserRound,
  ChevronRight,
  Pill,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import emptyPrescriptions from "../assets/empty-prescriptions.png";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";
import { obtenerRecetasPaciente } from "../services/recetasService.js";
import { descargarReceta as generarPDF } from "../utils/descargarReceta.js";

export default function Recetas() {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = obtenerUsuarioActivo();
  const paciente = location.state?.paciente || null;
  const pacienteActual = paciente || usuario;
  const pacienteId = pacienteActual?.id;

  const documentoRef = useRef(null);

  const [activeTab, setActiveTab] = useState("nuevas");
  const [recetas, setRecetas] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);

  // Cargar recetas del paciente
  const cargarDatos = () => {
    if (!pacienteId) {
      setRecetas([]);
      return;
    }

    setRecetas(obtenerRecetasPaciente(pacienteId));
  };

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  // Clasificar recetas
  const recetasFiltradas = recetas.filter((receta) => {
    const fechaReferencia =
      receta.fechaRegistro ||
      (receta.fecha ? `${receta.fecha}T12:00:00` : "");

    if (!fechaReferencia) return false;

    const fechaReceta = new Date(fechaReferencia);

    if (Number.isNaN(fechaReceta.getTime())) return false;

    const ahora = new Date();

    const inicioMesActual = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1
    );

    const inicioMesSiguiente = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      1
    );

    if (activeTab === "nuevas") {
      return (
        fechaReceta >= inicioMesActual &&
        fechaReceta < inicioMesSiguiente
      );
    }

    return fechaReceta < inicioMesActual;
  });

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const fechaLocal = new Date(`${fecha}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) return fecha;

    return fechaLocal.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Descargar PDF cuando el documento esté renderizado
  useEffect(() => {
    if (!recetaSeleccionada || !documentoRef.current) return;

    const descargar = async () => {
      try {
        await generarPDF(
          documentoRef.current,
          recetaSeleccionada
        );
      } finally {
        setRecetaSeleccionada(null);
      }
    };

    descargar();
  }, [recetaSeleccionada]);

  // Solicitar descarga
  const descargar = (receta) => {
    if (recetaSeleccionada) return;
    setRecetaSeleccionada(receta);
  };

  // Navegación inferior
  const navegarMenu = (id) => {
    const rutas = {
      inicio: "/essalud/inicio",
      citas: "/essalud/citas",
      chat: "/essalud/chat",
      perfil: "/essalud/perfil",
    };

    if (rutas[id]) navigate(rutas[id]);
  };

  // Comprobar sesión
  if (!usuario) {
    return (
      <main className="appointments-screen prescriptions-page">
        <section className="appointments-empty">
          <UserRound size={42} />
          <h2>Inicia sesión</h2>
          <p>
            Necesitas iniciar sesión para consultar tus recetas médicas.
          </p>

          <button
            type="button"
            className="appointments-book-button"
            onClick={() => navigate("/essalud/login")}
          >
            Iniciar sesión
          </button>
        </section>
      </main>
    );
  }

  const nombrePaciente =
    pacienteActual?.nombres || "tus";

  const tituloVacio =
    activeTab === "nuevas"
      ? "¡Aún no tienes recetas nuevas!"
      : "No tienes recetas anteriores";

  const mensajeVacio =
    activeTab === "nuevas"
      ? `Aquí aparecerán las recetas de ${nombrePaciente} cuando finalice una atención médica y se registre una prescripción.`
      : "Aquí encontrarás las recetas emitidas durante meses anteriores.";

  return (
    <main className="appointments-screen prescriptions-page">

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

        <h1>Recetas</h1>

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
              "Aquí puedes consultar las recetas médicas registradas después de tus atenciones."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* PESTAÑAS */}
      <div className="appointments-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "nuevas"}
          className={activeTab === "nuevas" ? "active" : ""}
          onClick={() => setActiveTab("nuevas")}
        >
          Nuevas
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "anteriores"}
          className={activeTab === "anteriores" ? "active" : ""}
          onClick={() => setActiveTab("anteriores")}
        >
          Anteriores
        </button>
      </div>

      {/* PACIENTE */}
      <div className="prescriptions-patient">
        <UserRound size={17} />

        <span>
          Recetas de{" "}
          <strong>
            {pacienteActual?.nombres ||
              pacienteActual?.nombre ||
              "Paciente"}
          </strong>
        </span>
      </div>

      {/* CONTENIDO */}
      <div className="prescriptions-content">
        {recetasFiltradas.length === 0 ? (
          <section className="prescriptions-empty">
            <div className="prescriptions-empty-main">
              <img
                src={emptyPrescriptions}
                alt="Ilustración de una profesional de salud"
                className="prescriptions-empty-image"
              />

              <h2>{tituloVacio}</h2>

              <p className="prescriptions-empty-description">
                {mensajeVacio}
              </p>
            </div>

            <section className="prescriptions-info-banner">
              <div className="prescriptions-info-icon">
                <FileText size={24} />
              </div>

              <div className="prescriptions-info-text">
                <h3>¿Cómo obtener una receta?</h3>

                <p>
                  Después de completar tu atención médica, si el
                  profesional registra una prescripción, podrás
                  consultarla y descargarla desde aquí.
                </p>
              </div>
            </section>
          </section>
        ) : (
          <section className="appointments-section">
            <div className="appointments-section-title">
              <h2>
                {activeTab === "nuevas"
                  ? "Recetas nuevas"
                  : "Recetas anteriores"}
              </h2>

              <span>{recetasFiltradas.length}</span>
            </div>

            {recetasFiltradas.map((receta) => (
              <article
                className="prescription-card"
                key={receta.id}
              >
                <div className="prescription-card-heading">
                  <span className="prescription-icon">
                    <FileText size={23} />
                  </span>

                  <div>
                    <h3>
                      {receta.especialidad || "Receta médica"}
                    </h3>

                    <p>
                      {receta.medico || "Profesional de salud"}
                    </p>
                  </div>
                </div>

                <div className="prescription-details">
                  <CalendarDays size={18} />
                  <span>{formatearFecha(receta.fecha)}</span>
                </div>

                <div className="prescription-details">
                  <Pill size={18} />

                  <span>
                    {(receta.medicamentos || []).length} medicamento(s)
                  </span>
                </div>

                <span className="prescription-status">
                  {receta.estado || "Emitida"}
                </span>

                <button
                  type="button"
                  className="prescription-download"
                  onClick={() => descargar(receta)}
                  disabled={!!recetaSeleccionada}
                >
                  <Download size={18} />
                  Descargar receta PDF
                </button>

                <button
                  type="button"
                  className="prescription-details-button"
                  onClick={() =>
                    navigate(`/essalud/receta/${receta.id}`, {
                      state: {
                        receta,
                        paciente: pacienteActual,
                      },
                    })
                  }
                >
                  Ver detalles
                  <ChevronRight size={18} />
                </button>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* DOCUMENTO PDF OCULTO PARA LA DESCARGA */}
      {recetaSeleccionada && (
        <div
          style={{
            position: "absolute",
            left: "-10000px",
            top: 0,
            width: "794px",
            background: "#ffffff",
          }}
          aria-hidden="true"
        >
          <div
            ref={documentoRef}
            id="receta-pdf"
            className="detalle-receta-documento"
          >
            {/* ENCABEZADO DEL PDF */}
            <div className="detalle-receta-pdf-header">
              <div className="detalle-receta-pdf-logo">
                <img src={logoEssalud} alt="EsSalud Digital" />

                <div>
                  <strong>EsSalud Digital</strong>
                  <span>Tu salud más cerca de ti</span>
                </div>
              </div>

              <span className="detalle-receta-pdf-label">
                RECETA MÉDICA
              </span>
            </div>

            {/* BANNER */}
            <div className="detalle-receta-banner">
              <div className="detalle-receta-banner-icon">
                <FileText size={27} />
              </div>

              <div className="detalle-receta-banner-info">
                <span>RECETA MÉDICA</span>
                <h2>Tu receta está disponible</h2>
                <p>
                  Consulta los detalles de tu atención médica.
                </p>
              </div>

              <span className="detalle-receta-id">
                {recetaSeleccionada.id}
              </span>
            </div>

            {/* PACIENTE */}
            <article className="detalle-receta-card">
              <div className="detalle-receta-card-title">
                <UserRound size={19} />
                <h3>Datos del paciente</h3>
              </div>

              <div className="detalle-receta-row">
                <span>Paciente</span>
                <strong>
                  {recetaSeleccionada.paciente ||
                    pacienteActual?.nombres ||
                    pacienteActual?.nombre ||
                    "No disponible"}
                </strong>
              </div>

              <div className="detalle-receta-row">
                <span>DNI</span>
                <strong>
                  {recetaSeleccionada.dni ||
                    pacienteActual?.dni ||
                    "No disponible"}
                </strong>
              </div>

              <div className="detalle-receta-row">
                <span>Fecha de atención</span>
                <strong>
                  {formatearFecha(recetaSeleccionada.fecha)}
                </strong>
              </div>

              <div className="detalle-receta-row">
                <span>Tipo de atención</span>
                <strong>
                  {recetaSeleccionada.tipoCita || "No especificado"}
                </strong>
              </div>
            </article>

            {/* PROFESIONAL */}
            <article className="detalle-receta-card">
              <div className="detalle-receta-card-title">
                <Stethoscope size={19} />
                <h3>Profesional de salud</h3>
              </div>

              <div className="detalle-receta-row">
                <span>Médico</span>
                <strong>
                  {recetaSeleccionada.medico || "No disponible"}
                </strong>
              </div>

              <div className="detalle-receta-row">
                <span>Especialidad</span>
                <strong>
                  {recetaSeleccionada.especialidad || "No disponible"}
                </strong>
              </div>

              {recetaSeleccionada.cmp && (
                <div className="detalle-receta-row">
                  <span>CMP</span>
                  <strong>{recetaSeleccionada.cmp}</strong>
                </div>
              )}
            </article>

            {/* DIAGNÓSTICO */}
            <article className="detalle-receta-card">
              <div className="detalle-receta-card-title">
                <FileText size={19} />
                <h3>Diagnóstico</h3>
              </div>

              <p className="detalle-receta-diagnostico">
                {recetaSeleccionada.diagnostico ||
                  "No se ha registrado un diagnóstico."}
              </p>
            </article>

            {/* MEDICAMENTOS */}
            <article className="detalle-receta-card">
              <div className="detalle-receta-card-title">
                <Pill size={19} />
                <h3>Medicamentos indicados</h3>

                <span className="detalle-receta-count">
                  {(recetaSeleccionada.medicamentos || []).length}
                </span>
              </div>

              {(recetaSeleccionada.medicamentos || []).length > 0 ? (
                <div className="detalle-receta-medicamentos">
                  {recetaSeleccionada.medicamentos.map(
                    (medicamento, index) => (
                      <div
                        className="detalle-medicamento"
                        key={medicamento.id || index}
                      >
                        <div className="detalle-medicamento-icon">
                          <Pill size={20} />
                        </div>

                        <div className="detalle-medicamento-info">
                          <h4>
                            {medicamento.nombre || "Medicamento"}
                          </h4>

                          <p>
                            <strong>Dosis:</strong>{" "}
                            {medicamento.dosis || "No especificada"}
                          </p>

                          <p>
                            <strong>Frecuencia:</strong>{" "}
                            {medicamento.frecuencia || "No especificada"}
                          </p>

                          <p>
                            <strong>Duración:</strong>{" "}
                            {medicamento.duracion || "No especificada"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="detalle-receta-sin-medicamentos">
                  No se han registrado medicamentos.
                </p>
              )}
            </article>

            {/* INDICACIONES */}
            <article className="detalle-receta-card">
              <div className="detalle-receta-card-title">
                <CalendarDays size={19} />
                <h3>Indicaciones adicionales</h3>
              </div>

              <p className="detalle-receta-indicaciones">
                {recetaSeleccionada.indicaciones ||
                  "No se han registrado indicaciones adicionales."}
              </p>
            </article>

            {/* PIE DEL DOCUMENTO */}
            <div className="detalle-receta-pdf-footer">
              <CheckCircle2 size={16} />

              <span>
                Documento generado desde EsSalud Digital
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
