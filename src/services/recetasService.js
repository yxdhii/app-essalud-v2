
const CLAVE_RECETAS = "essalud_recetas";

// Obtener todas las recetas guardadas.
export function obtenerRecetas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_RECETAS) || "[]");
  } catch {
    return [];
  }
}

// Obtener las recetas de un paciente.
// Funciona tanto para el titular como para sus familiares.
export function obtenerRecetasPaciente(pacienteId) {
  if (!pacienteId) return [];

  return obtenerRecetas().filter(
    (receta) =>
      String(receta.pacienteId || receta.usuarioId) === String(pacienteId)
  );
}

// Generar automáticamente una receta al completar una cita.
export function generarRecetaDesdeCita(cita) {
  if (!cita?.id) {
    return {
      correcto: false,
      mensaje: "No se recibió una cita válida.",
    };
  }

  const recetas = obtenerRecetas();

  // Evitar que una misma cita genere varias recetas.
  const recetaExistente = recetas.find(
    (receta) => receta.citaId === cita.id
  );

  if (recetaExistente) {
    return {
      correcto: true,
      mensaje: "La receta de esta cita ya está registrada.",
      receta: recetaExistente,
    };
  }

  // El paciente puede ser el titular o un familiar.
  const pacienteId = cita.pacienteId || cita.usuarioId;
  const pacienteDni = cita.pacienteDni || "";
  const nombrePaciente =
    cita.pacienteNombre ||
    (cita.paciente === "Yo" ? "" : cita.paciente) ||
    "Paciente";

  if (!pacienteId) {
    return {
      correcto: false,
      mensaje: "No se pudo identificar al paciente de la cita.",
    };
  }

  const ahora = new Date();

  const receta = {
    id: `REC-${Date.now()}`,
    citaId: cita.id,

    // Identificación del titular que reservó.
    titularId: cita.usuarioId,

    // Identificación del paciente atendido.
    pacienteId,
    paciente: nombrePaciente,
    dni: pacienteDni,
    parentesco: cita.parentesco || "Titular",

    tipoCita: cita.tipo,
    especialidad: cita.especialidad,
    medico: cita.medico,
    cmp: cita.cmp || "",
    fecha: cita.fecha,

    diagnostico: "Registro demostrativo de atención médica.",
    indicaciones:
      "Receta ficticia generada automáticamente para la simulación académica. No constituye una prescripción médica real.",

    medicamentos: [
      {
        nombre: "Medicamento de demostración",
        dosis: "Según indicación médica",
        frecuencia: "Según indicación médica",
        duracion: "Según indicación médica",
      },
    ],

    estado: "Emitida",
    tipo: "simulada",
    fechaRegistro: ahora.toISOString(),
  };

  try {
    localStorage.setItem(
      CLAVE_RECETAS,
      JSON.stringify([receta, ...recetas])
    );

    return {
      correcto: true,
      mensaje: "Receta generada correctamente.",
      receta,
    };
  } catch {
    return {
      correcto: false,
      mensaje: "No se pudo guardar la receta.",
    };
  }
}

// Consultar una receta por su identificador.
export function obtenerRecetaPorId(id) {
  return obtenerRecetas().find((receta) => receta.id === id) || null;
}

// Clasificar las recetas en nuevas y anteriores.
// Se toma como referencia la fecha de emisión.
export function obtenerRecetasPorPeriodo(pacienteId, periodo) {
  const recetas = obtenerRecetasPaciente(pacienteId);

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  return recetas.filter((receta) => {
    const fechaEmision = new Date(
      receta.fechaRegistro || `${receta.fecha}T12:00:00`
    );

    const esMesActual =
      fechaEmision.getMonth() === mesActual &&
      fechaEmision.getFullYear() === anioActual;

    return periodo === "nuevas" ? esMesActual : !esMesActual;
  });
}
