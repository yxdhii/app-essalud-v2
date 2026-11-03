
import { generarRecetaDesdeCita } from "./recetasService.js";

const CLAVE_CITAS = "essalud_citas";

function obtenerTodasLasCitas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CITAS)) || [];
  } catch {
    return [];
  }
}

// Obtener todas las citas de un paciente por su DNI.
// No depende de quién inició sesión o reservó la cita.
export function obtenerCitasPaciente(pacienteId) {
  if (!pacienteId) return [];

  return obtenerTodasLasCitas().filter(
    (cita) => String(cita.pacienteId) === String(pacienteId)
  );
}

// Mantener esta función para no romper otros componentes existentes.
export function obtenerCitasUsuario(usuarioId, pacienteId = null) {
  if (pacienteId) {
    return obtenerCitasPaciente(pacienteId);
  }

  if (!usuarioId) return [];

  return obtenerTodasLasCitas().filter(
    (cita) => String(cita.usuarioId) === String(usuarioId)
  );
}

// Obtener la próxima cita de un paciente.
export function obtenerProximaCitaPaciente(pacienteId) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return obtenerCitasPaciente(pacienteId)
    .filter((cita) => {
      const fecha = new Date(`${cita.fecha}T00:00:00`);

      return (
        (cita.estado === "Pendiente" || cita.estado === "Programada") &&
        fecha >= hoy
      );
    })
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora || "00:00"}:00`);
      const fechaB = new Date(`${b.fecha}T${b.hora || "00:00"}:00`);

      return fechaA - fechaB;
    })[0] || null;
}

// Mantener compatibilidad con componentes que todavía usan esta función.
export function obtenerProximaCita(usuarioId) {
  if (!usuarioId) return null;

  const citas = obtenerTodasLasCitas().filter(
    (cita) => String(cita.usuarioId) === String(usuarioId)
  );

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return citas
    .filter((cita) => {
      const fecha = new Date(`${cita.fecha}T00:00:00`);

      return (
        (cita.estado === "Pendiente" || cita.estado === "Programada") &&
        fecha >= hoy
      );
    })
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora || "00:00"}:00`);
      const fechaB = new Date(`${b.fecha}T${b.hora || "00:00"}:00`);

      return fechaA - fechaB;
    })[0] || null;
}

// Guardar una nueva cita.
export function guardarCita(nuevaCita) {
  if (!nuevaCita.usuarioId || !nuevaCita.pacienteId) {
    return {
      correcto: false,
      mensaje: "No se identificó al usuario o al paciente.",
    };
  }

  const citas = obtenerTodasLasCitas();

  const cita = {
    ...nuevaCita,
    id: crypto.randomUUID(),
    estado: "Pendiente",
    fechaRegistro: new Date().toISOString(),
  };

  localStorage.setItem(
    CLAVE_CITAS,
    JSON.stringify([...citas, cita])
  );

  return {
    correcto: true,
    cita,
  };
}

// Cancelar una cita.
export function cancelarCita(id) {
  const citas = obtenerTodasLasCitas();

  const actualizadas = citas.map((cita) =>
    cita.id === id
      ? { ...cita, estado: "Cancelada" }
      : cita
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));
}

// Calificar una cita.
export function calificarCita(id, puntuacion, comentario = "") {
  const citas = obtenerTodasLasCitas();

  const actualizadas = citas.map((cita) =>
    cita.id === id
      ? {
          ...cita,
          estado: "Atendida",
          calificacion: puntuacion,
          comentario,
        }
      : cita
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));
}

// Reprogramar una cita existente.
export function reprogramarCita(
  id,
  nuevaFecha,
  nuevaHora,
  nuevoHorario
) {
  const citas = obtenerTodasLasCitas();
  const citaExistente = citas.find((cita) => cita.id === id);

  if (!citaExistente) {
    return {
      correcto: false,
      mensaje: "No se encontró la cita.",
    };
  }

  if (
    citaExistente.estado === "Cancelada" ||
    citaExistente.estado === "Atendida"
  ) {
    return {
      correcto: false,
      mensaje: "Esta cita ya no se puede reprogramar.",
    };
  }

  const actualizadas = citas.map((cita) =>
    cita.id === id
      ? {
          ...cita,
          fecha: nuevaFecha,
          hora: nuevaHora,
          horario: nuevoHorario,
          estado: "Pendiente",
        }
      : cita
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));

  return { correcto: true };
}

// Completar una cita al finalizar la videoconsulta.
export function completarCita(id) {
  const citas = obtenerTodasLasCitas();
  const citaExistente = citas.find((cita) => cita.id === id);

  if (!citaExistente || citaExistente.estado !== "Pendiente") {
    return {
      correcto: false,
      mensaje: "No se encontró una cita pendiente para completar.",
    };
  }

  const actualizadas = citas.map((cita) =>
    cita.id === id
      ? {
          ...cita,
          estado: "Atendida",
          fechaAtencion: new Date().toISOString(),
        }
      : cita
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));

  const resultadoReceta = generarRecetaDesdeCita(citaExistente);

  return {
    correcto: true,
    mensaje: "La cita se completó correctamente.",
    recetaGenerada: resultadoReceta.correcto,
  };
}
