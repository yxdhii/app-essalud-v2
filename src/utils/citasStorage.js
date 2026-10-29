const STORAGE_KEY = "essalud_citas";

// Obtener todas las citas guardadas
export function obtenerCitas() {
  try {
    const citas = localStorage.getItem(STORAGE_KEY);
    return citas ? JSON.parse(citas) : [];
  } catch (error) {
    console.error("Error al obtener las citas:", error);
    return [];
  }
}

// Guardar la lista completa de citas
export function guardarCitas(citas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

// Registrar una nueva cita
export function guardarCita(datos) {
  const citas = obtenerCitas();

  const nuevaCita = {
    id: crypto.randomUUID(),
    ...datos,
    estado: "Pendiente",
    calificacion: null,
    comentario: "",
    creadaEn: new Date().toISOString(),
  };

  guardarCitas([...citas, nuevaCita]);

  return nuevaCita;
}

// Cancelar una cita pendiente
export function cancelarCita(id) {
  const citas = obtenerCitas().map((cita) =>
    cita.id === id && cita.estado === "Pendiente"
      ? { ...cita, estado: "Cancelada" }
      : cita
  );

  guardarCitas(citas);
  return citas;
}

// Calificar una cita atendida
export function calificarCita(id, calificacion, comentario = "") {
  const citas = obtenerCitas().map((cita) =>
    cita.id === id && cita.estado === "Atendida"
      ? { ...cita, calificacion, comentario }
      : cita
  );

  guardarCitas(citas);
  return citas;
}