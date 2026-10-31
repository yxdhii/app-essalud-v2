import { asegurados } from "../data/asegurados.js";
import { centrosAtencion } from "../data/centrosAtencion.js";

const CLAVE_USUARIOS = "essalud_usuarios";
const CLAVE_SESION = "essalud_usuario_activo";

// ============================================
// AVATARES PREDETERMINADOS
// ============================================

function obtenerEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const faltaCumplir =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate());

  if (faltaCumplir) edad--;

  return edad;
}

function obtenerAvatar(asegurado, parentesco = "") {
  // Priorizar el avatar definido en asegurados.js.
  if (asegurado?.avatar) {
    return asegurado.avatar;
  }

  const edad = obtenerEdad(asegurado?.fechaNacimiento);
  const relacion = parentesco.toLowerCase().trim();
  const sexo = asegurado?.sexo;

  // Adultos mayores.
  if (edad !== null && edad >= 60) {
    return sexo === "F" ? "👵🏻" : "👨🏻‍🦳";
  }

  // Niños y adolescentes.
  if (edad !== null && edad < 18) {
    return sexo === "F" ? "👧🏻" : "👦🏻";
  }

  // Adultos según el parentesco.
  if (["madre", "hermana", "hija"].includes(relacion)) {
    return "👩🏻";
  }

  if (["padre", "hermano", "hijo"].includes(relacion)) {
    return "👨🏻";
  }

  // Adultos según el sexo registrado.
  if (sexo === "F") return "👩🏻";
  if (sexo === "M") return "👨🏻";

  // Si no hay información suficiente, mostrar un icono genérico.
  return null;
}

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
    sexo: asegurado.sexo,
    avatar: asegurado.avatar || null,
    email: datos.email,
    phone: datos.phone,
    birthDate: asegurado.fechaNacimiento,
    direccion: asegurado.direccion || "",
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

  const centro = centrosAtencion.find((item) => item.id === usuario.centroId);

  if (!centro) {
    return {
      correcto: false,
      mensaje: "Tu centro de atención aún no está configurado.",
    };
  }

  const { password: _, ...usuarioPublico } = usuario;

  const asegurado = buscarAsegurado(usuario.dni);

  const sesion = {
    ...usuarioPublico,
    sexo: usuarioPublico.sexo || asegurado?.sexo,
    avatar: usuarioPublico.avatar || obtenerAvatar(asegurado),
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
  localStorage.setItem(CLAVE_FAMILIARES, JSON.stringify(vinculaciones));
}

// Obtener los familiares del titular actual.
export function obtenerFamiliaresVinculados(dniTitular) {
  const titular = String(
    dniTitular || obtenerUsuarioActivo()?.dni || "",
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
        avatar:
          vinculo.avatar ||
          asegurado.avatar ||
          obtenerAvatar(asegurado, vinculo.relation),
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
      avatar: asegurado.avatar || obtenerAvatar(asegurado, relation),
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
    (familiar) => familiar.dni !== dni,
  );

  guardarTodasLasVinculaciones(vinculaciones);

  return {
    correcto: true,
    mensaje: "Se eliminó la vinculación familiar.",
  };
}



export function actualizarDatosPersonales(datos) {
  const usuarioActivo = obtenerUsuarioActivo();

  if (!usuarioActivo) {
    return {
      correcto: false,
      mensaje: "Debes iniciar sesión para actualizar tus datos.",
    };
  }

  const telefono = String(datos.phone || "").trim();
  const direccion = String(datos.direccion || "").trim();

  if (!/^9\d{8}$/.test(telefono)) {
    return {
      correcto: false,
      mensaje: "Ingresa un celular válido de 9 dígitos.",
    };
  }

  if (direccion.length < 5) {
    return {
      correcto: false,
      mensaje: "Ingresa una dirección válida.",
    };
  }

  // Actualizar la cuenta guardada.
  const usuarios = obtenerUsuarios();

  const usuariosActualizados = usuarios.map((usuario) =>
    usuario.id === usuarioActivo.id
      ? { ...usuario, phone: telefono, direccion }
      : usuario
  );

  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify(usuariosActualizados)
  );

  // Actualizar la sesión activa.
  const nuevaSesion = {
    ...usuarioActivo,
    phone: telefono,
    direccion,
  };

  localStorage.setItem(
    CLAVE_SESION,
    JSON.stringify(nuevaSesion)
  );

  return {
    correcto: true,
    mensaje: "Tus datos se actualizaron correctamente.",
    usuario: nuevaSesion,
  };
}

// Cerrar sesión.
export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

