
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  FileText,
  Download,
  CalendarDays,
  UserRound,
  ChevronRight,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";

import logoEssalud from "../assets/digital-logo.png";
import emptyPrescriptions from "../assets/empty-prescriptions.png";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";

export default function Recetas() {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = obtenerUsuarioActivo();
  const paciente = location.state?.paciente || null;
  const pacienteActual = paciente || usuario;

  const [activeTab, setActiveTab] = useState("actual");
  const [recetas, setRecetas] = useState([]);

  // Inicializar las recetas del paciente.
  // Por ahora se utiliza una lista vacía.
  // Posteriormente se conectará con recetasService.js.
  useEffect(() => {
    setRecetas([]);
  }, [pacienteActual?.id, pacienteActual?.dni]);

  // Filtrar recetas según el periodo seleccionado.
  const recetasFiltradas = recetas.filter((receta) => {
    if (!receta.fecha) return false;

    const fechaReceta = new Date(`${receta.fecha}T12:00:00`);
    const ahora = new Date();

    if (Number.isNaN(fechaReceta.getTime())) return false;

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

    if (activeTab === "actual") {
      return (
        fechaReceta >= inicioMesActual &&
        fechaReceta < inicioMesSiguiente
      );
    }

    if (activeTab === "anteriores") {
      return fechaReceta < inicioMesActual;
    }

    return fechaReceta >= inicioMesSiguiente;
  });

  // Formatear fecha.
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

  // Descargar una receta.
  const descargarReceta = (receta) => {
    if (!receta.archivoUrl) {
      window.alert(
        "El archivo de esta receta todavía no está disponible para descargar."
      );
      return;
    }

    const enlace = document.createElement("a");

    enlace.href = receta.archivoUrl;
    enlace.download =
      receta.nombreArchivo || `receta-${receta.id}.pdf`;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  };

  // Navegación inferior.
  const navegarMenu = (id) => {
    if (id === "inicio") {
      navigate("/essalud/inicio");
    }

    if (id === "citas") {
      navigate("/essalud/citas");
    }

    if (id === "recetas") {
      navigate("/essalud/recetas", {
        state: paciente ? { paciente } : {},
      });
    }

    if (id === "perfil") {
      navigate("/essalud/perfil");
    }
  };

  // Comprobar sesión.
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

  // Textos del estado vacío.
  const tituloVacio =
    activeTab === "actual"
      ? "¡Aún no tienes recetas médicas!"
      : activeTab === "anteriores"
        ? "No tienes recetas anteriores"
        : "No tienes recetas próximas";

  const mensajeVacio =
    activeTab === "actual"
      ? "Aquí aparecerán tus recetas médicas cuando el profesional de salud las emita después de tu atención."
      : activeTab === "anteriores"
        ? "Aquí encontrarás las recetas emitidas en meses anteriores."
        : "Cuando tengas recetas registradas para este periodo, aparecerán aquí.";

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
              "Aquí puedes consultar las recetas médicas emitidas después de tus atenciones."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* PESTAÑAS */}
      <div
        className="prescriptions-tabs"
        role="tablist"
        aria-label="Periodo de recetas"
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
      <div className="prescriptions-content">
        {recetasFiltradas.length === 0 ? (
          /* ESTADO VACÍO */
          <section className="prescriptions-empty">
            <div className="prescriptions-empty-main">
              <img
                src={emptyPrescriptions}
                alt="Doctora sosteniendo una receta médica"
                className="prescriptions-empty-image"
              />

              <h2>{tituloVacio}</h2>

              <p className="prescriptions-empty-description">
                {mensajeVacio}
              </p>
            </div>

            {/* BANNER INFORMATIVO */}
            <section
              className="prescriptions-info-banner"
              aria-labelledby="prescriptions-info-title"
            >
              <div className="prescriptions-info-icon">
                <FileText size={24} />
              </div>

              <div className="prescriptions-info-text">
                <h3 id="prescriptions-info-title">
                  ¿Cómo obtener una receta?
                </h3>

                <p>
                  Después de tu consulta médica, el profesional de
                  salud podrá emitir una receta digital. Cuando esté
                  disponible, podrás consultarla y descargarla desde aquí.
                </p>
              </div>
            </section>
          </section>
        ) : (
          /* RECETAS DISPONIBLES */
          <section className="appointments-section">
            <div className="appointments-section-title">
              <h2>Recetas médicas</h2>
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
                      {receta.medicamento || "Receta médica"}
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

                {receta.indicaciones && (
                  <p className="prescription-instructions">
                    <strong>Indicaciones:</strong>{" "}
                    {receta.indicaciones}
                  </p>
                )}

                <button
                  type="button"
                  className="prescription-download"
                  onClick={() => descargarReceta(receta)}
                >
                  <Download size={18} />
                  Descargar receta
                </button>

                <button
                  type="button"
                  className="prescription-details-button"
                  onClick={() =>
                    navigate(`/essalud/receta/${receta.id}`, {
                      state: { receta, paciente },
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
    </main>
  );
}