import { generarRecetaDesdeCita } from "./recetasService.js";
const CLAVE_CITAS = "essalud_citas";

function obtenerTodasLasCitas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CITAS)) || [];
  } catch {
    return [];
  }
}

// Obtener las citas del titular y, opcionalmente, de un paciente específico.
export function obtenerCitasUsuario(usuarioId, pacienteId = null) {
  if (!usuarioId) return [];

  return obtenerTodasLasCitas().filter((cita) => {
    const perteneceAlTitular = cita.usuarioId === usuarioId;

    if (!perteneceAlTitular) return false;

    // Si se seleccionó un paciente, mostrar únicamente sus citas.
    if (pacienteId) {
      return String(cita.pacienteId) === String(pacienteId);
    }

    // Sin paciente específico, mostrar todas las citas de la cuenta.
    return true;
  });
}

// Obtener la próxima cita del usuario
export function obtenerProximaCita(usuarioId) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    obtenerCitasUsuario(usuarioId)
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
      })[0] || null
  );
}

// Guardar una nueva cita
export function guardarCita(nuevaCita) {
  if (!nuevaCita.usuarioId) {
    return {
      correcto: false,
      mensaje: "No se identificó al usuario.",
    };
  }

  const citas = obtenerTodasLasCitas();

  const cita = {
    ...nuevaCita,
    id: crypto.randomUUID(),
    estado: "Pendiente",
  };

  localStorage.setItem(CLAVE_CITAS, JSON.stringify([...citas, cita]));

  return {
    correcto: true,
    cita,
  };
}

// Cancelar una cita
export function cancelarCita(id) {
  const citas = obtenerTodasLasCitas();

  const actualizadas = citas.map((cita) =>
    cita.id === id ? { ...cita, estado: "Cancelada" } : cita,
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));
}

// Calificar una cita
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
      : cita,
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));
}

// Reprogramar una cita existente
export function reprogramarCita(id, nuevaFecha, nuevaHora, nuevoHorario) {
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
      : cita,
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));

  return { correcto: true };
}

// Marcar una cita como atendida al finalizar la videoconsulta

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
      : cita,
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));

  // Generar la receta automáticamente para el paciente atendido.
  const resultadoReceta = generarRecetaDesdeCita(citaExistente);

  return {
    correcto: true,
    mensaje: "La cita se completó correctamente.",
    recetaGenerada: resultadoReceta.correcto,
  };
}
