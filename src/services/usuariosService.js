import { asegurados } from "../data/asegurados.js";
import { centrosAtencion } from "../data/centrosAtencion.js";

// ============================================
// CLAVES DE LOCAL STORAGE
// ============================================

const CLAVE_USUARIOS = "essalud_usuarios";
const CLAVE_SESION = "essalud_usuario_activo";
const CLAVE_FAMILIARES = "essalud_familiares_vinculados";
const CLAVE_CUENTAS_GUARDADAS = "essalud_cuentas_agregadas";
const CLAVE_BIOMETRIA = "essalud_biometria";

const METODOS_BIOMETRICOS = ["fingerprint", "face"];

// ============================================
// UTILIDADES
// ============================================

// Obtener la edad de una persona.
function obtenerEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;

  const nacimiento = new Date(fechaNacimiento);

  if (Number.isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const faltaCumplir =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate());

  if (faltaCumplir) edad--;

  return edad;
}

// Obtener avatar predeterminado.
function obtenerAvatar(asegurado, parentesco = "") {
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

  // Adultos según parentesco.
  if (["madre", "hermana", "hija"].includes(relacion)) {
    return "👩🏻";
  }

  if (["padre", "hermano", "hijo"].includes(relacion)) {
    return "👨🏻";
  }

  // Adultos según sexo.
  if (sexo === "F") return "👩🏻";
  if (sexo === "M") return "👨🏻";

  return null;
}

// Leer información de Local Storage de forma segura.
function leerLocalStorage(clave, valorPredeterminado) {
  try {
    const contenido = localStorage.getItem(clave);

    return contenido
      ? JSON.parse(contenido)
      : valorPredeterminado;
  } catch (error) {
    console.error(`Error al leer ${clave}:`, error);
    return valorPredeterminado;
  }
}

// Guardar información en Local Storage.
function guardarLocalStorage(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.error(`Error al guardar ${clave}:`, error);
    return false;
  }
}

// ============================================
// GESTIÓN DE USUARIOS
// ============================================

// Obtener los usuarios registrados.
export function obtenerUsuarios() {
  return leerLocalStorage(CLAVE_USUARIOS, []);
}

// Buscar un asegurado por DNI.
export function buscarAsegurado(dni) {
  return asegurados.find(
    (usuario) => String(usuario.dni) === String(dni)
  );
}

// Registrar las credenciales de un asegurado autorizado.
export function registrarUsuario(datos) {
  const dni = String(datos.documentNumber || "").trim();
  const asegurado = buscarAsegurado(dni);

  if (!/^\d{8}$/.test(dni)) {
    return {
      correcto: false,
      mensaje: "Ingresa un DNI válido de 8 dígitos.",
    };
  }

  if (!asegurado) {
    return {
      correcto: false,
      mensaje: "No se encontró un asegurado de prueba con ese DNI.",
    };
  }

  const usuarios = obtenerUsuarios();

  if (
    usuarios.some(
      (usuario) => String(usuario.dni) === dni
    )
  ) {
    return {
      correcto: false,
      mensaje: "Este DNI ya tiene una cuenta registrada.",
    };
  }

  if (!datos.password) {
    return {
      correcto: false,
      mensaje: "Debes ingresar una contraseña.",
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

  const guardado = guardarLocalStorage(
    CLAVE_USUARIOS,
    [...usuarios, nuevoUsuario]
  );

  if (!guardado) {
    return {
      correcto: false,
      mensaje: "No fue posible registrar la cuenta.",
    };
  }

  return {
    correcto: true,
    mensaje: "Cuenta creada correctamente. Ahora puedes iniciar sesión.",
  };
}

// ============================================
// CUENTAS GUARDADAS EN EL DISPOSITIVO
// ============================================

// Obtener las cuentas guardadas.
export function obtenerCuentasGuardadas() {
  return leerLocalStorage(CLAVE_CUENTAS_GUARDADAS, []);
}

// Guardar o actualizar una cuenta de titular.
// Nunca se almacena la contraseña en esta lista.
function guardarCuentaDispositivo(usuario, accesoRapido = false) {
  const cuentas = obtenerCuentasGuardadas();

  const nuevaCuenta = {
    dni: String(usuario.dni),
    nombres: usuario.nombres,
    avatar: usuario.avatar || null,
    accesoRapido: Boolean(accesoRapido),
  };

  const existe = cuentas.some(
    (cuenta) => String(cuenta.dni) === String(usuario.dni)
  );

  const cuentasActualizadas = existe
    ? cuentas.map((cuenta) =>
        String(cuenta.dni) === String(usuario.dni)
          ? {
              ...cuenta,
              ...nuevaCuenta,
            }
          : cuenta
      )
    : [...cuentas, nuevaCuenta];

  return guardarLocalStorage(
    CLAVE_CUENTAS_GUARDADAS,
    cuentasActualizadas
  );
}

// ============================================
// AUTENTICACIÓN BIOMÉTRICA SIMULADA
// ============================================

// Validar el método biométrico.
function validarMetodoBiometrico(metodo) {
  return METODOS_BIOMETRICOS.includes(metodo);
}

// Obtener la configuración biométrica de un DNI.
export function obtenerConfiguracionBiometrica(dni) {
  const documento = String(dni || "").trim();

  const configuraciones = leerLocalStorage(
    CLAVE_BIOMETRIA,
    {}
  );

  const configuracion = configuraciones[documento] || {};

  return {
    fingerprint: configuracion.fingerprint === true,
    face: configuracion.face === true,
  };
}

// Habilitar un método biométrico para el usuario activo.
export function habilitarBiometriaSimulada(dni, metodo) {
  const documento = String(dni || "").trim();

  if (!/^\d{8}$/.test(documento) || !validarMetodoBiometrico(metodo)) {
    return {
      correcto: false,
      mensaje: "Los datos para activar la biometría no son válidos.",
    };
  }

  const usuarioActivo = obtenerUsuarioActivo();

  if (!usuarioActivo || String(usuarioActivo.dni) !== documento) {
    return {
      correcto: false,
      mensaje: "Debes iniciar sesión con esta cuenta para activar la biometría.",
    };
  }

  const usuario = obtenerUsuarios().find(
    (item) => String(item.dni) === documento
  );

  if (!usuario) {
    return {
      correcto: false,
      mensaje: "No se encontró la cuenta registrada.",
    };
  }

  const configuraciones = leerLocalStorage(
    CLAVE_BIOMETRIA,
    {}
  );

  configuraciones[documento] = {
    ...configuraciones[documento],
    [metodo]: true,
  };

  const guardado = guardarLocalStorage(
    CLAVE_BIOMETRIA,
    configuraciones
  );

  return {
    correcto: guardado,
    mensaje: guardado
      ? "Autenticación biométrica habilitada correctamente."
      : "No fue posible habilitar la biometría.",
  };
}

// Deshabilitar un método biométrico.
export function deshabilitarBiometriaSimulada(dni, metodo) {
  const documento = String(dni || "").trim();

  if (!/^\d{8}$/.test(documento) || !validarMetodoBiometrico(metodo)) {
    return {
      correcto: false,
      mensaje: "Los datos para desactivar la biometría no son válidos.",
    };
  }

  const usuarioActivo = obtenerUsuarioActivo();

  if (!usuarioActivo || String(usuarioActivo.dni) !== documento) {
    return {
      correcto: false,
      mensaje: "Debes iniciar sesión con esta cuenta para modificar la biometría.",
    };
  }

  const configuraciones = leerLocalStorage(
    CLAVE_BIOMETRIA,
    {}
  );

  configuraciones[documento] = {
    ...configuraciones[documento],
    [metodo]: false,
  };

  const guardado = guardarLocalStorage(
    CLAVE_BIOMETRIA,
    configuraciones
  );

  return {
    correcto: guardado,
    mensaje: guardado
      ? "Método biométrico desactivado correctamente."
      : "No fue posible desactivar la biometría.",
  };
}

// Verificar el método biométrico e iniciar sesión.
export function verificarBiometriaSimulada(dni, metodo) {
  const documento = String(dni || "").trim();

  if (!/^\d{8}$/.test(documento) || !validarMetodoBiometrico(metodo)) {
    return {
      correcto: false,
      mensaje: "Los datos de autenticación no son válidos.",
    };
  }

  const usuario = obtenerUsuarios().find(
    (item) => String(item.dni) === documento
  );

  if (!usuario) {
    return {
      correcto: false,
      mensaje: "No se encontró la cuenta registrada.",
    };
  }

  const configuraciones = leerLocalStorage(
    CLAVE_BIOMETRIA,
    {}
  );

  const configuracion = configuraciones[documento];

  if (!configuracion?.[metodo]) {
    return {
      correcto: false,
      mensaje: "Este método biométrico no está habilitado para esta cuenta. Ingresa con tu contraseña.",
    };
  }

  // Construir y guardar la sesión del usuario.
  const resultado = construirSesion(usuario);

  if (!resultado.correcto) {
    return resultado;
  }

  const sesionGuardada = establecerSesion(resultado.usuario);

  if (!sesionGuardada) {
    return {
      correcto: false,
      mensaje: "No fue posible iniciar la sesión.",
    };
  }

  return {
    correcto: true,
    mensaje: "Autenticación biométrica simulada correctamente.",
    usuario: resultado.usuario,
  };
}

// Eliminar una cuenta guardada del dispositivo.
export function eliminarCuentaGuardada(dni) {
  const cuentas = obtenerCuentasGuardadas();

  const cuentasActualizadas = cuentas.filter(
    (cuenta) => String(cuenta.dni) !== String(dni)
  );

  const correcto = guardarLocalStorage(
    CLAVE_CUENTAS_GUARDADAS,
    cuentasActualizadas
  );

  return {
    correcto,
    mensaje: correcto
      ? "Cuenta eliminada del dispositivo."
      : "No fue posible eliminar la cuenta.",
  };
}

// ============================================
// CONSTRUIR SESIÓN DEL USUARIO
// ============================================

// Preparar los datos públicos del usuario.
function construirSesion(usuario) {
  const centro = centrosAtencion.find(
    (item) => item.id === usuario.centroId
  );

  if (!centro) {
    return {
      correcto: false,
      mensaje: "Tu centro de atención aún no está configurado.",
    };
  }

  const {
    password: _password,
    ...usuarioPublico
  } = usuario;

  const asegurado = buscarAsegurado(usuario.dni);

  const sesion = {
    ...usuarioPublico,
    sexo: usuarioPublico.sexo || asegurado?.sexo,
    avatar:
      usuarioPublico.avatar ||
      obtenerAvatar(asegurado),
    centro,
  };

  return {
    correcto: true,
    usuario: sesion,
  };
}

// Activar una sesión.
function establecerSesion(sesion) {
  return guardarLocalStorage(CLAVE_SESION, sesion);
}

// ============================================
// INICIO DE SESIÓN
// ============================================

// Iniciar sesión mediante DNI y contraseña.
export function iniciarSesion(dni, password, recordar = false) {
  const documento = String(dni || "").trim();

  const usuario = obtenerUsuarios().find(
    (item) =>
      String(item.dni) === documento &&
      item.password === password
  );

  if (!usuario) {
    return {
      correcto: false,
      mensaje: "DNI o contraseña incorrectos, o la cuenta no está registrada.",
    };
  }

  const resultado = construirSesion(usuario);

  if (!resultado.correcto) {
    return resultado;
  }

  const sesionGuardada = establecerSesion(
    resultado.usuario
  );

  if (!sesionGuardada) {
    return {
      correcto: false,
      mensaje: "No fue posible iniciar la sesión.",
    };
  }

  // Recordar al titular según su preferencia.
  const cuentaGuardada = guardarCuentaDispositivo(
    resultado.usuario,
    recordar
  );

  if (!cuentaGuardada) {
    localStorage.removeItem(CLAVE_SESION);

    return {
      correcto: false,
      mensaje: "No fue posible guardar la preferencia de la cuenta.",
    };
  }

  return {
    correcto: true,
    mensaje: "Inicio de sesión exitoso.",
    usuario: resultado.usuario,
  };
}

// ============================================
// ACCESO RÁPIDO
// ============================================

// Iniciar sesión sin pedir contraseña
// cuando el titular activó "Recordar mi cuenta".
export function iniciarSesionRecordada(dni) {
  const documento = String(dni || "").trim();

  const cuenta = obtenerCuentasGuardadas().find(
    (item) =>
      String(item.dni) === documento &&
      item.accesoRapido === true
  );

  if (!cuenta) {
    return {
      correcto: false,
      mensaje: "Esta cuenta requiere ingresar su contraseña.",
    };
  }

  const usuario = obtenerUsuarios().find(
    (item) => String(item.dni) === documento
  );

  if (!usuario) {
    return {
      correcto: false,
      mensaje: "No se encontró la cuenta registrada.",
    };
  }

  const resultado = construirSesion(usuario);

  if (!resultado.correcto) {
    return resultado;
  }

  const sesionGuardada = establecerSesion(
    resultado.usuario
  );

  if (!sesionGuardada) {
    return {
      correcto: false,
      mensaje: "No fue posible recuperar la sesión.",
    };
  }

  return {
    correcto: true,
    mensaje: "Acceso rápido realizado correctamente.",
    usuario: resultado.usuario,
  };
}

// Recuperar el usuario que inició sesión.
export function obtenerUsuarioActivo() {
  return leerLocalStorage(CLAVE_SESION, null);
}

// ============================================
// ACTUALIZAR DATOS PERSONALES
// ============================================

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

  // Actualizar el usuario registrado.
  const usuarios = obtenerUsuarios();

  const usuariosActualizados = usuarios.map((usuario) =>
    String(usuario.dni) === String(usuarioActivo.dni)
      ? {
          ...usuario,
          phone: telefono,
          direccion,
        }
      : usuario
  );

  const usuariosGuardados = guardarLocalStorage(
    CLAVE_USUARIOS,
    usuariosActualizados
  );

  if (!usuariosGuardados) {
    return {
      correcto: false,
      mensaje: "No fue posible actualizar tus datos.",
    };
  }

  // Actualizar la sesión activa.
  const nuevaSesion = {
    ...usuarioActivo,
    phone: telefono,
    direccion,
  };

  establecerSesion(nuevaSesion);

  return {
    correcto: true,
    mensaje: "Tus datos se actualizaron correctamente.",
    usuario: nuevaSesion,
  };
}

// ============================================
// FAMILIARES VINCULADOS
// ============================================

// Obtener todas las vinculaciones.
function obtenerTodasLasVinculaciones() {
  return leerLocalStorage(CLAVE_FAMILIARES, {});
}

// Guardar las vinculaciones.
function guardarTodasLasVinculaciones(vinculaciones) {
  return guardarLocalStorage(
    CLAVE_FAMILIARES,
    vinculaciones
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

  if (
    familiaresActuales.some(
      (familiar) => String(familiar.dni) === dni
    )
  ) {
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
      avatar:
        asegurado.avatar ||
        obtenerAvatar(asegurado, relation),
      color: "#d8edff",
    },
  ];

  const guardado = guardarTodasLasVinculaciones(
    vinculaciones
  );

  if (!guardado) {
    return {
      correcto: false,
      mensaje: "No fue posible guardar la vinculación.",
    };
  }

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

  const existe = familiaresActuales.some(
    (familiar) => String(familiar.dni) === dni
  );

  if (!existe) {
    return {
      correcto: false,
      mensaje: "Este familiar no está vinculado a tu cuenta.",
    };
  }

  vinculaciones[dniTitular] = familiaresActuales.filter(
    (familiar) => String(familiar.dni) !== dni
  );

  const guardado = guardarTodasLasVinculaciones(
    vinculaciones
  );

  if (!guardado) {
    return {
      correcto: false,
      mensaje: "No fue posible eliminar la vinculación.",
    };
  }

  return {
    correcto: true,
    mensaje: "Se eliminó la vinculación familiar.",
  };
}

// ============================================
// CERRAR SESIÓN
// ============================================

// Cerrar únicamente la sesión activa.
// Las cuentas recordadas permanecen en el dispositivo.
export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);

  return {
    correcto: true,
    mensaje: "Sesión cerrada correctamente.",
  };
}