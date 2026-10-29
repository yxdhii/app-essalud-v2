
const CLAVE_CITAS = "essalud_citas";

function obtenerTodasLasCitas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CITAS)) || [];
  } catch {
    return [];
  }
}

// Obtener únicamente las citas del usuario
export function obtenerCitasUsuario(usuarioId) {
  if (!usuarioId) return [];

  return obtenerTodasLasCitas().filter(
    (cita) => cita.usuarioId === usuarioId
  );
}

// Obtener la próxima cita del usuario
export function obtenerProximaCita(usuarioId) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return obtenerCitasUsuario(usuarioId)
    .filter((cita) => {
      const fecha = new Date(`${cita.fecha}T00:00:00`);

      return (
        (cita.estado === "Pendiente" ||
          cita.estado === "Programada") &&
        fecha >= hoy
      );
    })
    .sort((a, b) => {
      const fechaA = new Date(
        `${a.fecha}T${a.hora || "00:00"}:00`
      );

      const fechaB = new Date(
        `${b.fecha}T${b.hora || "00:00"}:00`
      );

      return fechaA - fechaB;
    })[0] || null;
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

  localStorage.setItem(
    CLAVE_CITAS,
    JSON.stringify([...citas, cita])
  );

  return {
    correcto: true,
    cita,
  };
}

// Cancelar una cita
export function cancelarCita(id) {
  const citas = obtenerTodasLasCitas();

  const actualizadas = citas.map((cita) =>
    cita.id === id
      ? { ...cita, estado: "Cancelada" }
      : cita
  );

  localStorage.setItem(
    CLAVE_CITAS,
    JSON.stringify(actualizadas)
  );
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
      : cita
  );

  localStorage.setItem(
    CLAVE_CITAS,
    JSON.stringify(actualizadas)
  );
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
      : cita
  );

  localStorage.setItem(
    CLAVE_CITAS,
    JSON.stringify(actualizadas)
  );

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
      ? { ...cita, estado: "Atendida" }
      : cita
  );

  localStorage.setItem(CLAVE_CITAS, JSON.stringify(actualizadas));

  return { correcto: true };
}