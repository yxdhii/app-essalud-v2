
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

// ============================================
// FAMILIARES VINCULADOS
// ============================================

const CLAVE_FAMILIARES = "essalud_familiares_vinculados";

// Obtener todas las vinculaciones guardadas.
function obtenerTodasLasVinculaciones() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FAMILIARES)) || {};
  } catch {
    return {};
  }
}

// Guardar las vinculaciones.
function guardarTodasLasVinculaciones(vinculaciones) {
  localStorage.setItem(
    CLAVE_FAMILIARES,
    JSON.stringify(vinculaciones)
  );
}

// Obtener los familiares del titular actual.
export function obtenerFamiliaresVinculados(dniTitular) {
  const titular = String(
    dniTitular || obtenerUsuarioActivo()?.dni || ""
  ).trim();

  if (!titular) return [];

  const vinculaciones = obtenerTodasLasVinculaciones();

  return (vinculaciones[titular] || [])
    .map((vinculo) => {
      const asegurado = buscarAsegurado(vinculo.dni);

      if (!asegurado) return null;

      return {
        ...asegurado,
        relation: vinculo.relation,
        avatar: vinculo.avatar || "👤",
        color: vinculo.color || "#d8edff",
      };
    })
    .filter(Boolean);
}

// Vincular un familiar.
export function vincularFamiliar(dniFamiliar, parentesco) {
  const usuarioActivo = obtenerUsuarioActivo();

  if (!usuarioActivo) {
    return {
      correcto: false,
      mensaje: "Debes iniciar sesión para vincular familiares.",
    };
  }

  const dniTitular = String(usuarioActivo.dni);
  const dni = String(dniFamiliar || "").trim();
  const relation = String(parentesco || "").trim();

  if (!dni || !relation) {
    return {
      correcto: false,
      mensaje: "Ingresa el DNI y el parentesco del familiar.",
    };
  }

  if (dni === dniTitular) {
    return {
      correcto: false,
      mensaje: "No puedes vincular tu propia cuenta como familiar.",
    };
  }

  const asegurado = buscarAsegurado(dni);

  if (!asegurado) {
    return {
      correcto: false,
      mensaje: "No se encontró ese DNI entre los asegurados de prueba.",
    };
  }

  const vinculaciones = obtenerTodasLasVinculaciones();
  const familiaresActuales = vinculaciones[dniTitular] || [];

  if (familiaresActuales.some((familiar) => familiar.dni === dni)) {
    return {
      correcto: false,
      mensaje: "Este familiar ya está vinculado a tu cuenta.",
    };
  }

  vinculaciones[dniTitular] = [
    ...familiaresActuales,
    {
      dni,
      relation,
      avatar: relation.toLowerCase() === "hijo" ? "👦🏻" : "👤",
      color: "#d8edff",
    },
  ];

  guardarTodasLasVinculaciones(vinculaciones);

  return {
    correcto: true,
    mensaje: "Familiar vinculado correctamente.",
    familiar: asegurado,
  };
}

// Desvincular un familiar.
export function desvincularFamiliar(dniFamiliar) {
  const usuarioActivo = obtenerUsuarioActivo();

  if (!usuarioActivo) {
    return {
      correcto: false,
      mensaje: "Debes iniciar sesión para gestionar tus familiares.",
    };
  }

  const dniTitular = String(usuarioActivo.dni);
  const dni = String(dniFamiliar || "").trim();

  const vinculaciones = obtenerTodasLasVinculaciones();
  const familiaresActuales = vinculaciones[dniTitular] || [];

  if (!familiaresActuales.some((familiar) => familiar.dni === dni)) {
    return {
      correcto: false,
      mensaje: "Este familiar no está vinculado a tu cuenta.",
    };
  }

  vinculaciones[dniTitular] = familiaresActuales.filter(
    (familiar) => familiar.dni !== dni
  );

  guardarTodasLasVinculaciones(vinculaciones);

  return {
    correcto: true,
    mensaje: "Se eliminó la vinculación familiar.",
  };
}

// Cerrar sesión.
export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}
