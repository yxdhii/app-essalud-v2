
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  FileText,
  CalendarDays,
  UserRound,
  Building2,
  Download,
  CheckCircle2,
  Clock3,
  Hash,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";

import {
  obtenerExamenPorId,
} from "../services/examenesService.js";

import {
  obtenerUsuarioActivo,
  obtenerFamiliaresVinculados,
} from "../services/usuariosService.js";

export default function DetalleExamen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const usuario = obtenerUsuarioActivo();

  const [examen, setExamen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [accesoValido, setAccesoValido] = useState(false);

  // Familiares vinculados a la cuenta autenticada.
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

  // Recuperar y validar el examen.
  useEffect(() => {
    if (!usuario) {
      setExamen(null);
      setAccesoValido(false);
      setCargando(false);
      return;
    }

    const examenEncontrado = obtenerExamenPorId(id);

    if (!examenEncontrado) {
      setExamen(null);
      setAccesoValido(false);
      setCargando(false);
      return;
    }

    // El examen debe pertenecer al titular o a un familiar
    // vinculado a su cuenta.
    const pacienteAutorizado = pacientesDisponibles.find(
      (persona) =>
        String(persona.dni) ===
        String(examenEncontrado.pacienteId)
    );

    if (!pacienteAutorizado) {
      setExamen(null);
      setAccesoValido(false);
      setCargando(false);
      return;
    }

    setExamen(examenEncontrado);
    setAccesoValido(true);
    setCargando(false);
  }, [id, usuario?.id]);

  // Regresar a la lista de exámenes.
  const volverAExamenes = () => {
    navigate("/essalud/examenes");
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

  // Identificar al paciente mediante su DNI.
  const paciente = pacientesDisponibles.find(
    (persona) =>
      String(persona?.dni) === String(examen?.pacienteId)
  );

  const nombrePaciente =
    examen?.pacienteNombre ||
    paciente?.nombres ||
    paciente?.nombre ||
    "Paciente";

  const dniPaciente =
    examen?.pacienteId ||
    "No disponible";

  // Mantener la atribución original de quien gestionó el examen.
  const nombreSolicitante =
    examen?.solicitanteNombre ||
    "No disponible";

  // Comprobar disponibilidad del resultado.
  const estadoExamen = examen?.estado?.toLowerCase();

  const resultadoDisponible =
    ["disponible", "completado", "atendido"].includes(
      estadoExamen
    ) ||
    Boolean(examen?.resultadoUrl || examen?.archivoUrl);

  // Descargar resultado.
  const descargarResultado = () => {
    const archivo =
      examen?.resultadoUrl || examen?.archivoUrl;

    if (!archivo) return;

    window.open(
      archivo,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (cargando) {
    return (
      <main className="appointments-screen detalle-examen-page">
        <div className="detalle-examen-content">
          <p>Consultando información del examen...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="appointments-screen detalle-examen-page">

      {/* ENCABEZADO */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={volverAExamenes}
          aria-label="Volver a mis exámenes"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Detalle del examen</h1>

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
              "Aquí puedes consultar la información de tu examen médico, verificar su estado y revisar tus resultados."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="detalle-examen-content">
        {!examen || !accesoValido ? (
          <section className="detalle-examen-not-found">
            <FileText size={46} />

            <h2>
              {usuario
                ? "Examen no encontrado"
                : "Inicia sesión"}
            </h2>

            <p>
              {usuario
                ? "No se encontró el examen o no tienes autorización para consultar este registro."
                : "Necesitas iniciar sesión para consultar tus exámenes."}
            </p>

            <button
              type="button"
              onClick={() =>
                usuario
                  ? volverAExamenes()
                  : navigate("/essalud")
              }
            >
              {usuario
                ? "Volver a mis exámenes"
                : "Iniciar sesión"}
            </button>
          </section>
        ) : (
          <>
            {/* PRESENTACIÓN */}
            <section className="detalle-examen-banner">
              <div className="detalle-examen-banner-icon">
                <FileText size={28} />
              </div>

              <div>
                <h2>Información del examen</h2>
                <p>
                  Consulta los datos y el estado de tu examen médico.
                </p>
              </div>
            </section>

            {/* ESTADO */}
            <section className="detalle-examen-status-card">
              <div className="detalle-examen-status-icon">
                {resultadoDisponible ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Clock3 size={24} />
                )}
              </div>

              <div>
                <span>Estado del examen</span>
                <strong>{examen.estado || "Pendiente"}</strong>
              </div>
            </section>

            {/* DATOS DEL PACIENTE */}
            <section className="detalle-examen-card">
              <h3>
                <UserRound size={19} />
                Datos del paciente
              </h3>

              <div className="detalle-examen-row">
                <span>Paciente</span>
                <strong>{nombrePaciente}</strong>
              </div>

              <div className="detalle-examen-row">
                <span>DNI</span>
                <strong>{dniPaciente}</strong>
              </div>

              <div className="detalle-examen-row">
                <span>Parentesco</span>
                <strong>{examen.parentesco || "Titular"}</strong>
              </div>

              <div className="detalle-examen-row">
                <span>Gestionado por</span>
                <strong>{nombreSolicitante}</strong>
              </div>
            </section>

            {/* INFORMACIÓN DEL EXAMEN */}
            <section className="detalle-examen-card">
              <h3>
                <FileText size={19} />
                Datos del examen
              </h3>

              <div className="detalle-examen-row">
                <span>Nombre del examen</span>
                <strong>
                  {examen.nombre || "Examen médico"}
                </strong>
              </div>

              <div className="detalle-examen-row">
                <span>Tipo de examen</span>
                <strong>
                  {examen.tipo || "No especificado"}
                </strong>
              </div>

              <div className="detalle-examen-row">
                <span>
                  <CalendarDays size={15} />
                  Fecha
                </span>
                <strong>{formatearFecha(examen.fecha)}</strong>
              </div>

              <div className="detalle-examen-row">
                <span>
                  <Building2 size={15} />
                  Establecimiento
                </span>
                <strong>
                  {examen.laboratorio || "No especificado"}
                </strong>
              </div>

              <div className="detalle-examen-row">
                <span>
                  <Hash size={15} />
                  Código
                </span>
                <strong>{examen.id}</strong>
              </div>
            </section>

            {/* RESULTADOS */}
            <section className="detalle-examen-card">
              <h3>
                <FileText size={19} />
                Resultados del examen
              </h3>

              {resultadoDisponible ? (
                <div className="detalle-examen-result-available">
                  <CheckCircle2 size={23} />

                  <div>
                    <strong>Resultado disponible</strong>
                    <p>
                      Puedes consultar o descargar el resultado
                      de tu examen.
                    </p>
                  </div>

                  {(examen.resultadoUrl || examen.archivoUrl) && (
                    <button
                      type="button"
                      className="detalle-examen-download"
                      onClick={descargarResultado}
                    >
                      <Download size={17} />
                      Descargar resultado
                    </button>
                  )}

                  {examen.resultado && (
                    <p className="detalle-examen-result-text">
                      {examen.resultado}
                    </p>
                  )}
                </div>
              ) : (
                <div className="detalle-examen-result-pending">
                  <Clock3 size={23} />

                  <div>
                    <strong>Resultado pendiente</strong>
                    <p>
                      Los resultados de tu examen todavía no se
                      encuentran disponibles. Podrás consultarlos
                      cuando sean publicados.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* INFORMACIÓN ADICIONAL */}
            <div className="detalle-examen-footer">
              <CircleHelp size={19} />

              <p>
                Si tienes alguna consulta sobre tu examen o sus
                resultados, comunícate con tu establecimiento de salud.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
