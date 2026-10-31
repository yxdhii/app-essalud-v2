import React, { useEffect, useState } from "react";
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
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";

import logoEssalud from "../assets/digital-logo.png";
import emptyPrescriptions from "../assets/empty-prescriptions.png";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";
import { obtenerRecetasPaciente } from "../services/recetasService.js";

export default function Recetas() {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = obtenerUsuarioActivo();
  const paciente = location.state?.paciente || null;
  const pacienteActual = paciente || usuario;
  const pacienteId = pacienteActual?.id;

  const [activeTab, setActiveTab] = useState("nuevas");
  const [recetas, setRecetas] = useState([]);

  // Cargar las recetas del paciente seleccionado.
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

  // Clasificar recetas en nuevas y anteriores.
  const recetasFiltradas = recetas.filter((receta) => {
    const fechaReferencia =
      receta.fechaRegistro || (receta.fecha ? `${receta.fecha}T12:00:00` : "");

    if (!fechaReferencia) return false;

    const fechaReceta = new Date(fechaReferencia);

    if (Number.isNaN(fechaReceta.getTime())) return false;

    const ahora = new Date();

    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const inicioMesSiguiente = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      1,
    );

    if (activeTab === "nuevas") {
      return fechaReceta >= inicioMesActual && fechaReceta < inicioMesSiguiente;
    }

    return fechaReceta < inicioMesActual;
  });

  // Formatear fechas.
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

  // Escapar contenido HTML antes de generar el documento.
  const escaparHTML = (valor) => {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
      const entidades = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entidades[caracter];
    });
  };

  // Imprimir o guardar receta como PDF.
  const descargarReceta = (receta) => {
    const ventana = window.open("", "_blank");

    if (!ventana) {
      window.alert("Permite las ventanas emergentes para imprimir la receta.");
      return;
    }

    const medicamentos = receta.medicamentos || [];

    const pacienteNombre =
      receta.paciente || pacienteActual?.nombres || "Paciente";

    const pacienteDni = receta.dni || pacienteActual?.dni || "";

    const medicamentosHTML = medicamentos
      .map(
        (medicamento) => `
          <div class="medicamento">
            <strong>${escaparHTML(medicamento.nombre)}</strong>
            <p>Dosis: ${escaparHTML(medicamento.dosis)}</p>
            <p>Frecuencia: ${escaparHTML(medicamento.frecuencia)}</p>
            <p>Duración: ${escaparHTML(medicamento.duracion)}</p>
          </div>
        `,
      )
      .join("");

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receta ${escaparHTML(receta.id)}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            color: #426b88;
            padding: 35px;
            max-width: 750px;
            margin: auto;
          }

          h1 {
            color: #3998d2;
          }

          .dato {
            margin: 12px 0;
          }

          .medicamento {
            border: 1px solid #dcebf4;
            border-radius: 10px;
            padding: 14px;
            margin: 12px 0;
          }

          .aviso {
            background: #eaf7fd;
            border-radius: 8px;
            padding: 12px;
            margin-top: 25px;
            font-size: 12px;
          }

          button {
            background: #3998d2;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            margin-top: 20px;
          }

          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <h1>EsSalud Digital</h1>
        <h2>Receta médica - Documento demostrativo</h2>

        <div class="dato">
          <strong>Paciente:</strong>
          ${escaparHTML(pacienteNombre)}
        </div>

        <div class="dato">
          <strong>DNI:</strong>
          ${escaparHTML(pacienteDni)}
        </div>

        <div class="dato">
          <strong>Especialidad:</strong>
          ${escaparHTML(receta.especialidad)}
        </div>

        <div class="dato">
          <strong>Profesional:</strong>
          ${escaparHTML(receta.medico)}
        </div>

        <div class="dato">
          <strong>Fecha:</strong>
          ${escaparHTML(formatearFecha(receta.fecha))}
        </div>

        <div class="dato">
          <strong>Diagnóstico:</strong>
          ${escaparHTML(receta.diagnostico || "No especificado")}
        </div>

        <h3>Medicamentos</h3>

        ${medicamentosHTML}

        <p>
          <strong>Indicaciones:</strong>
          ${escaparHTML(receta.indicaciones || "Sin indicaciones adicionales")}
        </p>

        <div class="aviso">
          DOCUMENTO FICTICIO DE DEMOSTRACIÓN.
          No constituye una receta médica real.
        </div>

        <button onclick="window.print()">
          Imprimir / Guardar como PDF
        </button>
      </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();
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

  // Comprobar sesión.
  if (!usuario) {
    return (
      <main className="appointments-screen prescriptions-page">
        <section className="appointments-empty">
          <UserRound size={42} />

          <h2>Inicia sesión</h2>

          <p>Necesitas iniciar sesión para consultar tus recetas médicas.</p>

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

  const nombrePaciente = pacienteActual?.nombres || "tus";

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
              "Aquí puedes consultar las recetas médicas registradas después de tus atenciones.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* PESTAÑAS - MISMO DISEÑO QUE MIS CITAS */}
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
            {pacienteActual?.nombres || pacienteActual?.nombre || "Paciente"}
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

              <p className="prescriptions-empty-description">{mensajeVacio}</p>
            </div>

            <section className="prescriptions-info-banner">
              <div className="prescriptions-info-icon">
                <FileText size={24} />
              </div>

              <div className="prescriptions-info-text">
                <h3>¿Cómo obtener una receta?</h3>

                <p>
                  Después de completar tu atención médica, si el profesional
                  registra una prescripción, podrás consultarla y descargarla
                  desde aquí.
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
              <article className="prescription-card" key={receta.id}>
                <div className="prescription-card-heading">
                  <span className="prescription-icon">
                    <FileText size={23} />
                  </span>

                  <div>
                    <h3>{receta.especialidad || "Receta médica"}</h3>

                    <p>{receta.medico || "Profesional de salud"}</p>
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
                  onClick={() => descargarReceta(receta)}
                >
                  <Download size={18} />
                  Imprimir / Guardar PDF
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
    </main>
  );
}
