
const CLAVE_NOTIFICACIONES = "essalud_notificaciones";

export function crearNotificacion({
  dni,
  tipo,
  titulo,
  mensaje,
  ruta,
}) {
  const notificaciones = JSON.parse(
    localStorage.getItem(CLAVE_NOTIFICACIONES) || "[]"
  );

  const nuevaNotificacion = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dni: String(dni || ""),
    tipo,
    titulo,
    mensaje,
    ruta,
    fecha: new Date().toISOString(),
    leida: false,
  };

  notificaciones.push(nuevaNotificacion);

  localStorage.setItem(
    CLAVE_NOTIFICACIONES,
    JSON.stringify(notificaciones)
  );

  window.dispatchEvent(new Event("essalud-notificacion"));

  return nuevaNotificacion;
}
