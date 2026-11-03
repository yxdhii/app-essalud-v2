import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CircleHelp,
  FlaskConical,
  FileText,
  CalendarDays,
  Download,
  UserRound,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";
import emptyExams from "../assets/empty-exams.png";

export default function Examenes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("actual");

  // Posteriormente se conectará con el servicio de exámenes.
  const examenes = [];

  const examenesFiltrados = examenes.filter((examen) => {
    if (activeTab === "anteriores") {
      return examen.periodo === "anteriores";
    }

    if (activeTab === "actual") {
      return examen.periodo === "actual";
    }

    return examen.periodo === "siguientes";
  });

  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") navigate("/essalud/citas");
    if (id === "recetas") navigate("/essalud/recetas");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  const tituloVacio =
    activeTab === "anteriores"
      ? "No tienes exámenes anteriores"
      : activeTab === "actual"
        ? "¡Aún no tienes exámenes médicos!"
        : "No tienes exámenes próximos";

  const mensajeVacio =
    activeTab === "anteriores"
      ? "Aquí aparecerán los exámenes que te hayas realizado anteriormente."
      : activeTab === "actual"
        ? "Aquí aparecerán tus exámenes médicos y podrás consultar tus resultados cuando estén disponibles en tu historial."
        : "Cuando tengas exámenes programados para este periodo, aparecerán aquí.";

  return (
    <main className="appointments-screen prescriptions-page examenes-page">
      {/* ENCABEZADO REUTILIZADO: MISMO DISEÑO QUE RECETAS */}
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
              "Aquí puedes consultar tus exámenes médicos y revisar los resultados cuando estén disponibles.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

{/* PESTAÑAS - MISMO DISEÑO QUE RECETAS */}
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

              <p className="prescriptions-empty-description">{mensajeVacio}</p>
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
                  Consulta tus resultados aquí cuando el establecimiento de
                  salud los registre.
                </p>
              </div>
            </section>
          </section>
        ) : (
          <section className="appointments-section">
            <div className="appointments-section-title">
              <h2>Mis exámenes médicos</h2>
              <span>{examenesFiltrados.length}</span>
            </div>

            {examenesFiltrados.map((examen) => (
              <article className="examen-card" key={examen.id}>
                <div className="examen-card-heading">
                  <span className="examen-icon">
                    <FlaskConical size={23} />
                  </span>

                  <div className="examen-card-heading-text">
                    <h3>{examen.nombre}</h3>
                    <p>{examen.laboratorio || "Establecimiento de salud"}</p>
                  </div>
                </div>

                <div className="examen-details">
                  <CalendarDays size={17} />
                  <span>{examen.fecha || "Fecha no disponible"}</span>
                </div>

                <span
                  className={`examen-status ${
                    examen.estado === "Disponible" ? "disponible" : "pendiente"
                  }`}
                >
                  {examen.estado === "Disponible"
                    ? "Resultado disponible"
                    : "Pendiente"}
                </span>

                {examen.estado === "Disponible" && (
                  <div className="examen-actions">
                    {examen.resultadoUrl && (
                      <button
                        type="button"
                        onClick={() => navigate(examen.resultadoUrl)}
                      >
                        <FileText size={17} />
                        Ver resultados
                      </button>
                    )}

                    {examen.archivoUrl && (
                      <a
                        href={examen.archivoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download size={17} />
                        Descargar PDF
                      </a>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>

    </main>
  );
}
