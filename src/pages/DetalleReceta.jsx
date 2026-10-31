
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  FileText,
  CalendarDays,
  UserRound,
  Pill,
  Download,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

import html2pdf from "html2pdf.js";

import logoEssalud from "../assets/digital-logo.png";

import { obtenerRecetaPorId } from "../services/recetasService.js";
import { obtenerUsuarioActivo } from "../services/usuariosService.js";


export default function DetalleReceta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const usuario = obtenerUsuarioActivo();

  const receta =
    location.state?.receta || obtenerRecetaPorId(id);

  const paciente =
    location.state?.paciente || usuario;

  // Formatear fecha
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

  // Volver a mis recetas
  const volverARecetas = () => {
    navigate("/essalud/recetas", {
      state: { paciente },
    });
  };

  // Descargar receta en PDF
  
const descargarReceta = async () => {
  const elemento = document.getElementById("receta-pdf");

  if (!elemento) {
    window.alert("No se encontró la receta.");
    return;
  }

  elemento.classList.add("generando-pdf");

  try {
    // Esperar a que las imágenes estén cargadas
    const imagenes = Array.from(elemento.querySelectorAll("img"));

    await Promise.all(
      imagenes.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const opciones = {
      margin: [10, 10, 10, 10],
      filename: `Receta_${receta.id}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        windowWidth: 794,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    await html2pdf()
      .set(opciones)
      .from(elemento)
      .save();

  } catch (error) {
    console.error("Error al generar el PDF:", error);
    window.alert("No se pudo descargar la receta. Inténtalo nuevamente.");
  } finally {
    elemento.classList.remove("generando-pdf");
  }
};


  // Encabezado compartido con Mis citas
  const renderizarEncabezado = () => (
    <header className="appointments-header">
      <button
        type="button"
        className="appointments-back"
        onClick={volverARecetas}
        aria-label="Volver a recetas"
      >
        <ArrowLeft size={23} />
      </button>

      <h1>Detalle de receta</h1>

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
            "Aquí puedes consultar la información de tu receta médica."
          )
        }
      >
        <CircleHelp size={18} />
      </button>
    </header>
  );

  // Si no se encuentra la receta
  if (!receta) {
    return (
      <main className="appointments-screen detalle-receta-screen">
        {renderizarEncabezado()}

        <section className="detalle-receta-content">
          <div className="detalle-receta-no-encontrada">
            <FileText size={42} />

            <h2>Receta no encontrada</h2>

            <p>
              No pudimos encontrar la información de esta receta médica.
            </p>

            <button
              type="button"
              onClick={volverARecetas}
            >
              Volver a mis recetas
            </button>
          </div>
        </section>
      </main>
    );
  }

  const medicamentos = receta.medicamentos || [];

  return (
    <main className="appointments-screen detalle-receta-screen">

      {/* ENCABEZADO */}
      {renderizarEncabezado()}

      {/* CONTENIDO */}
      <section className="detalle-receta-content">

        {/* DOCUMENTO QUE SE DESCARGARÁ */}
        <div
          id="receta-pdf"
          className="detalle-receta-documento"
        >

          {/* ENCABEZADO DEL PDF */}
          <div className="detalle-receta-pdf-header">
            <div className="detalle-receta-pdf-logo">
              <img
                src={logoEssalud}
                alt="EsSalud Digital"
              />

              <div>
                <strong>EsSalud Digital</strong>
                <span>Tu salud más cerca de ti</span>
              </div>
            </div>

            <span className="detalle-receta-pdf-label">
              RECETA MÉDICA
            </span>
          </div>

          {/* BANNER PRINCIPAL */}
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
              {receta.id}
            </span>
          </div>

          {/* DATOS DEL PACIENTE */}
          <article className="detalle-receta-card">
            <div className="detalle-receta-card-title">
              <UserRound size={19} />
              <h3>Datos del paciente</h3>
            </div>

            <div className="detalle-receta-row">
              <span>Paciente</span>

              <strong>
                {receta.paciente ||
                  paciente?.nombres ||
                  "No disponible"}
              </strong>
            </div>

            <div className="detalle-receta-row">
              <span>DNI</span>

              <strong>
                {receta.dni ||
                  paciente?.dni ||
                  "No disponible"}
              </strong>
            </div>

            <div className="detalle-receta-row">
              <span>Fecha de atención</span>

              <strong>
                {formatearFecha(receta.fecha)}
              </strong>
            </div>

            <div className="detalle-receta-row">
              <span>Tipo de atención</span>

              <strong>
                {receta.tipoCita || "No especificado"}
              </strong>
            </div>
          </article>

          {/* PROFESIONAL DE SALUD */}
          <article className="detalle-receta-card">
            <div className="detalle-receta-card-title">
              <Stethoscope size={19} />
              <h3>Profesional de salud</h3>
            </div>

            <div className="detalle-receta-row">
              <span>Médico</span>

              <strong>
                {receta.medico || "No disponible"}
              </strong>
            </div>

            <div className="detalle-receta-row">
              <span>Especialidad</span>

              <strong>
                {receta.especialidad || "No disponible"}
              </strong>
            </div>

            {receta.cmp && (
              <div className="detalle-receta-row">
                <span>CMP</span>
                <strong>{receta.cmp}</strong>
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
              {receta.diagnostico ||
                "No se ha registrado un diagnóstico."}
            </p>
          </article>

          {/* MEDICAMENTOS */}
          <article className="detalle-receta-card">
            <div className="detalle-receta-card-title">
              <Pill size={19} />

              <h3>Medicamentos indicados</h3>

              <span className="detalle-receta-count">
                {medicamentos.length}
              </span>
            </div>

            {medicamentos.length > 0 ? (
              <div className="detalle-receta-medicamentos">
                {medicamentos.map((medicamento, index) => (
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
                ))}
              </div>
            ) : (
              <p className="detalle-receta-sin-medicamentos">
                No se han registrado medicamentos.
              </p>
            )}
          </article>

          {/* INDICACIONES ADICIONALES */}
          <article className="detalle-receta-card">
            <div className="detalle-receta-card-title">
              <CalendarDays size={19} />
              <h3>Indicaciones adicionales</h3>
            </div>

            <p className="detalle-receta-indicaciones">
              {receta.indicaciones ||
                "No se han registrado indicaciones adicionales."}
            </p>
          </article>



          {/* PIE DEL DOCUMENTO PDF */}
          <div className="detalle-receta-pdf-footer">
            <CheckCircle2 size={16} />

            <span>
              Documento generado desde EsSalud Digital
            </span>
          </div>

        </div>

        {/* BOTÓN DE DESCARGA */}
        <button
          type="button"
          className="detalle-receta-print"
          onClick={descargarReceta}
        >
          <Download size={19} />
          Descargar receta PDF
        </button>

      </section>
    </main>
  );
}
