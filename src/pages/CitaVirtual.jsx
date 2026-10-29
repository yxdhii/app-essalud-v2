import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { completarCita } from "../services/citasService.js";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function CitaVirtual() {
  const navigate = useNavigate();
  const location = useLocation();

  // Datos de la cita seleccionada
  const cita = location.state?.cita;

  // Estados de la videollamada
  const [segundos, setSegundos] = useState(0);
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [camaraActiva, setCamaraActiva] = useState(true);
  const [llamadaActiva, setLlamadaActiva] = useState(true);
  const [videoPrincipal, setVideoPrincipal] = useState("doctor");

  // Información del médico
  const nombreMedico = cita?.medico || "Dr. Carlos Mendoza";
  const especialidad = cita?.especialidad || "Medicina General";
  const cmp = cita?.cmp || "65432";

  // Información del paciente
  const inicialesPaciente = "YS";

  // Cronómetro
  useEffect(() => {
    if (!llamadaActiva) return;

    const intervalo = window.setInterval(() => {
      setSegundos((actual) => actual + 1);
    }, 1000);

    return () => window.clearInterval(intervalo);
  }, [llamadaActiva]);

  // Formato MM:SS
  const formatearTiempo = (tiempo) => {
    const minutos = Math.floor(tiempo / 60);
    const segundosRestantes = tiempo % 60;

    return `${String(minutos).padStart(2, "0")}:${String(
      segundosRestantes,
    ).padStart(2, "0")}`;
  };

  // Intercambiar posiciones sin cambiar los archivos de video
  const intercambiarVideos = () => {
    setVideoPrincipal((actual) =>
      actual === "doctor" ? "paciente" : "doctor",
    );
  };

  // Finalizar llamada
  const finalizarLlamada = () => {
  const resultado = completarCita(cita.id);

  if (!resultado.correcto) {
    window.alert(resultado.mensaje);
    return;
  }

  setLlamadaActiva(false);
};
  // Regresar a Mis citas
  const regresarACitas = () => {
    navigate("/essalud/citas");
  };

  // Evitar errores si no existe una cita seleccionada
  if (!cita) {
    return (
      <main className="videollamada-error">
        <h2>No se encontró la cita</h2>

        <p>
          Ingresa desde el detalle de una cita para iniciar la videoconsulta.
        </p>

        <button type="button" onClick={regresarACitas}>
          Volver a mis citas
        </button>
      </main>
    );
  }

  // Determinar quién ocupa cada posición
  const doctorEsPrincipal = videoPrincipal === "doctor";
  const pacienteEsPrincipal = videoPrincipal === "paciente";

  return (
    <main className="videollamada">
      {/* ENCABEZADO */}
      <header className="videollamada-header">
        <button
          type="button"
          className="videollamada-volver"
          onClick={() => navigate(-1)}
          aria-label="Volver al detalle de la cita"
          title="Volver"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="videollamada-titulo">
          <span className="videollamada-punto" />

          <div>
            <h1>Videoconsulta segura</h1>

            <p>
              <ShieldCheck size={13} />
              Conexión protegida
            </p>
          </div>
        </div>

        <span
          className="videollamada-tiempo"
          role="timer"
          aria-label={`Duración de la llamada: ${formatearTiempo(segundos)}`}
        >
          {formatearTiempo(segundos)}
        </span>
      </header>

      {/* ÁREA PRINCIPAL */}
      <section
        className="videollamada-doctor"
        aria-label="Pantalla de videoconsulta"
      >
        {llamadaActiva ? (
          <>
            {/* VIDEO DEL DOCTOR: SIEMPRE USA doctor.mp4 */}
            <video
              className={`video-doctor ${
                doctorEsPrincipal ? "video-en-principal" : "video-en-ventana"
              }`}
              src="/videos/doctor.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Video del médico"
            />

            {/* VIDEO DEL PACIENTE: SIEMPRE USA paciente.mp4 */}
            {camaraActiva ? (
              <video
                className={`video-paciente ${
                  pacienteEsPrincipal
                    ? "video-paciente-principal"
                    : "video-paciente-pequeno"
                }`}
                src="/videos/paciente.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label="Video del paciente"
              />
            ) : (
              <div
                className={`paciente-avatar-video ${
                  pacienteEsPrincipal
                    ? "paciente-avatar-principal"
                    : "paciente-avatar-pequeno"
                }`}
                aria-label="Cámara del paciente apagada"
              >
                {inicialesPaciente}
              </div>
            )}

            {/* ESTADO DE LA CONSULTA */}
            <div className="doctor-superposicion">
              <span className="doctor-en-linea" />
              <span>En consulta</span>
            </div>

            {/* VENTANA PEQUEÑA INTERACTIVA */}
            <button
              type="button"
              className="paciente-ventana"
              onClick={intercambiarVideos}
              aria-label="Intercambiar videos"
            >
              {doctorEsPrincipal ? (
                camaraActiva ? (
                  <video
                    className="video-miniatura"
                    src="/videos/paciente.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <span className="miniatura-avatar">YS</span>
                )
              ) : (
                <video
                  className="video-miniatura"
                  src="/videos/doctor.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              )}

              <span className="paciente-etiqueta">
                {doctorEsPrincipal ? "Tú" : nombreMedico}
              </span>
            </button>

            {/* INFORMACIÓN DEL PARTICIPANTE PRINCIPAL */}
            <div className="doctor-informacion">
              <div className="doctor-avatar">
                {doctorEsPrincipal ? "CM" : inicialesPaciente}
              </div>

              <h2>{doctorEsPrincipal ? nombreMedico : "Tú"}</h2>

              <p>{doctorEsPrincipal ? especialidad : "Paciente"}</p>

              {doctorEsPrincipal && <span>CMP {cmp}</span>}
            </div>
          </>
        ) : (
          /* PANTALLA AL FINALIZAR */
          <div className="video-finalizado">
            <div className="doctor-avatar">
              <Phone size={28} />
            </div>

            <h2>Videoconsulta finalizada</h2>

            <p>
              La llamada ha terminado. Gracias por utilizar EsSalud Digital.
            </p>
          </div>
        )}
      </section>

      {/* CONTROLES */}
      <footer className="videollamada-controles">
        {llamadaActiva ? (
          <>
            {/* MICRÓFONO SIMULADO */}
            <button
              type="button"
              className={`control-llamada ${
                !microfonoActivo ? "control-desactivado" : ""
              }`}
              onClick={() => setMicrofonoActivo((activo) => !activo)}
              aria-label={
                microfonoActivo ? "Silenciar micrófono" : "Activar micrófono"
              }
              aria-pressed={!microfonoActivo}
            >
              {microfonoActivo ? <Mic size={23} /> : <MicOff size={23} />}

              <span>{microfonoActivo ? "Silenciar" : "Activar"}</span>
            </button>

            {/* FINALIZAR LLAMADA */}
            <button
              type="button"
              className="control-llamada control-finalizar"
              onClick={finalizarLlamada}
              aria-label="Finalizar videoconsulta"
            >
              <Phone size={25} />
              <span>Finalizar</span>
            </button>

            {/* CÁMARA SIMULADA */}
            <button
              type="button"
              className={`control-llamada ${
                !camaraActiva ? "control-desactivado" : ""
              }`}
              onClick={() => setCamaraActiva((activa) => !activa)}
              aria-label={camaraActiva ? "Apagar cámara" : "Encender cámara"}
              aria-pressed={!camaraActiva}
            >
              {camaraActiva ? <Video size={23} /> : <VideoOff size={23} />}

              <span>{camaraActiva ? "Cámara" : "Activar cámara"}</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="boton-regresar-citas"
            onClick={regresarACitas}
          >
            Volver a mis citas
          </button>
        )}
      </footer>
    </main>
  );
}
