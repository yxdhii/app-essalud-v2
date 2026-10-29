
import { asegurados } from "../data/asegurados.js";
import { centrosAtencion } from "../data/centrosAtencion.js";

const CLAVE_USUARIOS = "essalud_usuarios";
const CLAVE_SESION = "essalud_usuario_activo";

// Obtener los usuarios registrados en el navegador.
export function obtenerUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || [];
  } catch {
    return [];
  }
}

// Buscar un asegurado de prueba por su DNI.
export function buscarAsegurado(dni) {
  return asegurados.find((usuario) => usuario.dni === dni);
}

// Registrar las credenciales de un asegurado autorizado para la simulación.
export function registrarUsuario(datos) {
  const asegurado = buscarAsegurado(datos.documentNumber);

  if (!asegurado) {
    return {
      correcto: false,
      mensaje: "No se encontró un asegurado de prueba con ese DNI.",
    };
  }

  const usuarios = obtenerUsuarios();

  if (usuarios.some((usuario) => usuario.dni === datos.documentNumber)) {
    return {
      correcto: false,
      mensaje: "Este DNI ya tiene una cuenta registrada.",
    };
  }

  const nuevoUsuario = {
    id: asegurado.id,
    dni: asegurado.dni,
    nombres: asegurado.nombres,
    email: datos.email,
    phone: datos.phone,
    birthDate: datos.birthDate,
    password: datos.password,
    centroId: asegurado.centroId,
  };

  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify([...usuarios, nuevoUsuario]),
  );

  return {
    correcto: true,
    mensaje: "Cuenta creada correctamente. Ahora puedes iniciar sesión.",
  };
}

// Validar las credenciales.
export function iniciarSesion(dni, password) {
  const usuario = obtenerUsuarios().find(
    (item) => item.dni === dni && item.password === password,
  );

  if (!usuario) {
    return {
      correcto: false,
      mensaje: "DNI o contraseña incorrectos, o la cuenta no está registrada.",
    };
  }

  const centro = centrosAtencion.find(
    (item) => item.id === usuario.centroId,
  );

  if (!centro) {
    return {
      correcto: false,
      mensaje: "Tu centro de atención aún no está configurado.",
    };
  }

  const { password: _, ...usuarioPublico } = usuario;

  const sesion = {
    ...usuarioPublico,
    centro,
  };

  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

  return {
    correcto: true,
    usuario: sesion,
  };
}

// Recuperar el usuario que inició sesión.
export function obtenerUsuarioActivo() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION)) || null;
  } catch {
    return null;
  }
}

// Cerrar sesión.
export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}
