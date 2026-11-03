
const CLAVE_RECETAS = "essalud_recetas";

// Obtener todas las recetas guardadas.
export function obtenerRecetas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_RECETAS) || "[]");
  } catch {
    return [];
  }
}

// Obtener recetas exclusivamente del paciente.
// pacienteId: DNI del paciente.
// identificadorAlternativo: compatibilidad con recetas antiguas
// del titular que no tenían pacienteId.
export function obtenerRecetasPaciente(
  pacienteId,
  identificadorAlternativo = null
) {
  if (!pacienteId) return [];

  return obtenerRecetas().filter((receta) => {
    const idPaciente = String(receta.pacienteId || "");

    // Coincidencia exacta del DNI del paciente.
    if (idPaciente === String(pacienteId)) {
      return true;
    }

    // Compatibilidad únicamente con registros antiguos
    // que no tengan un pacienteId registrado.
    const esRecetaAntigua = !receta.pacienteId;

    const coincideTitularAntiguo =
      esRecetaAntigua &&
      identificadorAlternativo &&
      String(receta.usuarioId || receta.titularId || "") ===
        String(identificadorAlternativo);

    return Boolean(coincideTitularAntiguo);
  });
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
    (receta) => String(receta.citaId) === String(cita.id)
  );

  if (recetaExistente) {
    return {
      correcto: true,
      mensaje: "La receta de esta cita ya está registrada.",
      receta: recetaExistente,
    };
  }

  // Identificar al paciente atendido.
  const pacienteId = cita.pacienteId || cita.pacienteDni;

  if (!pacienteId) {
    return {
      correcto: false,
      mensaje: "No se pudo identificar al paciente de la cita.",
    };
  }

  const nombrePaciente =
    cita.pacienteNombre ||
    (cita.paciente === "Yo" ? "" : cita.paciente) ||
    "Paciente";

  const ahora = new Date();

  const receta = {
    id: `REC-${Date.now()}`,
    citaId: cita.id,

    // Titular que administra la cuenta.
    usuarioId: cita.usuarioId || null,
    titularId: cita.usuarioId || null,
    solicitanteId: cita.solicitanteId || cita.usuarioId || null,
    solicitanteNombre: cita.solicitanteNombre || "Titular",

    // Paciente que recibió la atención.
    pacienteId: String(pacienteId),
    paciente: nombrePaciente,
    pacienteNombre: nombrePaciente,
    dni: String(cita.pacienteDni || cita.pacienteId || ""),
    parentesco: cita.parentesco || "No especificado",

    tipoCita: cita.tipo || "",
    especialidad: cita.especialidad || "",
    medico: cita.medico || "",
    cmp: cita.cmp || "",
    fecha: cita.fecha || "",

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
  return (
    obtenerRecetas().find(
      (receta) => String(receta.id) === String(id)
    ) || null
  );
}

// Clasificar las recetas en nuevas y anteriores.
export function obtenerRecetasPorPeriodo(
  pacienteId,
  periodo,
  identificadorAlternativo = null
) {
  const recetas = obtenerRecetasPaciente(
    pacienteId,
    identificadorAlternativo
  );

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  return recetas.filter((receta) => {
    const fechaEmision = new Date(
      receta.fechaRegistro ||
        `${receta.fecha}T12:00:00`
    );

    if (Number.isNaN(fechaEmision.getTime())) {
      return false;
    }

    const esMesActual =
      fechaEmision.getMonth() === mesActual &&
      fechaEmision.getFullYear() === anioActual;

    return periodo === "nuevas"
      ? esMesActual
      : !esMesActual;
  });
}
