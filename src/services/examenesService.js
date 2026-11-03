
const CLAVE_EXAMENES = "essalud_examenes";

// Obtener todos los exámenes.
export function obtenerExamenes() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_EXAMENES) || "[]");
  } catch {
    return [];
  }
}

// Guardar la lista.
function guardarExamenes(examenes) {
  localStorage.setItem(CLAVE_EXAMENES, JSON.stringify(examenes));
}

// Calcular periodo.
export function calcularPeriodo(fecha) {
  if (!fecha) return "actual";

  const fechaExamen = new Date(`${fecha}T12:00:00`);
  const hoy = new Date();

  const inicioMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  );

  const inicioMesSiguiente = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    1
  );

  if (fechaExamen < inicioMes) return "anteriores";
  if (fechaExamen >= inicioMesSiguiente) return "siguientes";

  return "actual";
}

// Registrar un nuevo examen.
export function registrarExamen(datosExamen) {
  if (!datosExamen?.usuarioId) {
    return {
      correcto: false,
      mensaje: "No se identificó la cuenta titular.",
    };
  }

  if (!datosExamen?.pacienteId) {
    return {
      correcto: false,
      mensaje: "No se identificó al paciente del examen.",
    };
  }

  const examenes = obtenerExamenes();

  const fecha =
    datosExamen.fecha ||
    new Date().toISOString().split("T")[0];

  const nuevoExamen = {
    id: `EX-${Date.now()}`,

    // Cuenta que administra el registro.
    usuarioId: String(datosExamen.usuarioId),
    titularId: String(
      datosExamen.titularId || datosExamen.usuarioId
    ),

    // Persona que gestiona el examen.
    solicitanteId: String(
      datosExamen.solicitanteId || datosExamen.usuarioId
    ),
    solicitanteNombre: datosExamen.solicitanteNombre || "",

    // Paciente al que pertenece.
    pacienteId: String(datosExamen.pacienteId),
    pacienteNombre: datosExamen.pacienteNombre || "",
    parentesco: datosExamen.parentesco || "Titular",

    // Información del examen.
    nombre: datosExamen.nombre || "Examen médico",
    tipo: datosExamen.tipo || "Laboratorio",
    laboratorio:
      datosExamen.laboratorio || "Establecimiento de salud",
    fecha,

    // Resultado.
    estado: datosExamen.estado || "Pendiente",
    resultado: datosExamen.resultado || null,
    resultadoUrl: datosExamen.resultadoUrl || null,
    archivoUrl: datosExamen.archivoUrl || null,

    periodo: calcularPeriodo(fecha),
    fechaRegistro: new Date().toISOString(),
  };

  try {
    guardarExamenes([...examenes, nuevoExamen]);

    return {
      correcto: true,
      mensaje: "Examen registrado correctamente.",
      examen: nuevoExamen,
    };
  } catch {
    return {
      correcto: false,
      mensaje: "No se pudo guardar el examen.",
    };
  }
}

// Obtener exámenes de una cuenta.
// Con pacienteId, devuelve únicamente los de ese paciente.
export function obtenerExamenesUsuario(usuarioId, pacienteId = null) {
  if (!usuarioId) return [];

  return obtenerExamenes().filter((examen) => {
    const perteneceCuenta =
      String(examen.usuarioId) === String(usuarioId) ||
      String(examen.titularId) === String(usuarioId);

    if (!perteneceCuenta) return false;

    if (pacienteId) {
      return String(examen.pacienteId) === String(pacienteId);
    }

    return true;
  });
}

// Obtener exclusivamente los exámenes de un paciente por DNI.
// Esta función permite que el propio paciente vea los exámenes
// gestionados anteriormente por un familiar autorizado.
export function obtenerExamenesPaciente(pacienteId) {
  if (!pacienteId) return [];

  return obtenerExamenes().filter(
    (examen) =>
      String(examen.pacienteId) === String(pacienteId)
  );
}

// Obtener un examen por ID.
export function obtenerExamenPorId(id) {
  return (
    obtenerExamenes().find(
      (examen) => String(examen.id) === String(id)
    ) || null
  );
}

// Actualizar examen.
export function actualizarExamen(id, nuevosDatos) {
  const examenes = obtenerExamenes();

  const indice = examenes.findIndex(
    (examen) => String(examen.id) === String(id)
  );

  if (indice === -1) {
    return {
      correcto: false,
      mensaje: "No se encontró el examen.",
    };
  }

  const examenActualizado = {
    ...examenes[indice],
    ...nuevosDatos,

    // No permitir cambiar el ID ni el paciente por accidente.
    id: examenes[indice].id,
    pacienteId: examenes[indice].pacienteId,
    usuarioId: examenes[indice].usuarioId,
    titularId: examenes[indice].titularId,
  };

  if (nuevosDatos.fecha) {
    examenActualizado.periodo = calcularPeriodo(
      nuevosDatos.fecha
    );
  }

  examenes[indice] = examenActualizado;

  try {
    guardarExamenes(examenes);

    return {
      correcto: true,
      mensaje: "Examen actualizado correctamente.",
      examen: examenActualizado,
    };
  } catch {
    return {
      correcto: false,
      mensaje: "No se pudo actualizar el examen.",
    };
  }
}

// Eliminar examen.
export function eliminarExamen(id) {
  const examenes = obtenerExamenes();

  const actualizados = examenes.filter(
    (examen) => String(examen.id) !== String(id)
  );

  guardarExamenes(actualizados);

  return {
    correcto: true,
    mensaje: "Examen eliminado correctamente.",
  };
}
