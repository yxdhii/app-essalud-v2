
const STORAGE_KEY = "essalud_citas";

export function obtenerCitas() {
  try {
    const citas = localStorage.getItem(STORAGE_KEY);
    return citas ? JSON.parse(citas) : [];
  } catch {
    return [];
  }
}

export function guardarCitas(citas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

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

export function cancelarCita(id) {
  const citas = obtenerCitas().map((cita) =>
    cita.id === id && cita.estado === "Pendiente"
      ? { ...cita, estado: "Cancelada" }
      : cita
  );

  guardarCitas(citas);

  return citas;
}

export function calificarCita(id, calificacion, comentario = "") {
  const citas = obtenerCitas().map((cita) =>
    cita.id === id && cita.estado === "Atendida"
      ? { ...cita, calificacion, comentario }
      : cita
  );

  guardarCitas(citas);

  return citas;
}