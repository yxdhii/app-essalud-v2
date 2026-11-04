import React, { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  ArrowLeft,

  CircleHelp,

  UserRound,

  LockKeyhole,

  Accessibility,

  Volume2,

  Contrast,

  Sun,

  Moon,

  Type,

  ChevronRight,

  ChevronUp,

  ShieldCheck,

  Pencil,

  Camera,

  Upload,

  Trash2,

  X,

  ImagePlus,

  Check,

} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";

import logoEssalud from "../assets/digital-logo.png";

import { obtenerUsuarioActivo } from "../services/usuariosService.js";

import { useAccessibility } from "../context/AccessibilityContext";

export default function Perfil() {

  const navigate = useNavigate();

  const usuario = obtenerUsuarioActivo();

  const inputFotoRef = useRef(null);

  // ==========================================

  // FOTO DE PERFIL

  // ==========================================

  const [fotoPerfil, setFotoPerfil] = useState(usuario?.fotoPerfil || "");

  const [modalFotoAbierto, setModalFotoAbierto] = useState(false);

  const [fotoTemporal, setFotoTemporal] = useState(usuario?.fotoPerfil || "");

  const [fotoEliminada, setFotoEliminada] = useState(false);

  const [errorFoto, setErrorFoto] = useState("");

  // ==========================================

  // ACCESIBILIDAD GLOBAL

  // ==========================================

  const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(true);

  const [sonido, setSonido] = useState(true);


  const {

    tema,

    setTema,

    contraste,

    setContraste,

    tamanoTexto,

    setTamanoTexto,
    lecturaVoz,
    setLecturaVoz,
  } = useAccessibility();

  // ==========================================

  // ABRIR MODAL DE FOTO

  // ==========================================

  const abrirModalFoto = () => {

    setFotoTemporal(fotoPerfil);

    setFotoEliminada(false);

    setErrorFoto("");

    setModalFotoAbierto(true);

  };

  // ==========================================

  // SELECCIONAR IMAGEN

  // ==========================================

  const seleccionarFoto = (e) => {

    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setErrorFoto("");

    if (!archivo.type.startsWith("image/")) {

      setErrorFoto("Selecciona un archivo de imagen válido.");

      e.target.value = "";

      return;

    }

    if (archivo.size > 2 * 1024 * 1024) {

      setErrorFoto("La imagen no debe superar los 2 MB.");

      e.target.value = "";

      return;

    }

    const lector = new FileReader();

    lector.onload = () => {

      setFotoTemporal(lector.result);

      setFotoEliminada(false);

      setErrorFoto("");

    };

    lector.onerror = () => {

      setErrorFoto("No se pudo cargar la imagen. Inténtalo nuevamente.");

    };

    lector.readAsDataURL(archivo);

    e.target.value = "";

  };

  // ==========================================

  // ELIMINAR FOTO

  // ==========================================

  const eliminarFoto = () => {

    setFotoTemporal("");

    setFotoEliminada(true);

    setErrorFoto("");

  };

  // ==========================================

  // GUARDAR FOTO EN LOCALSTORAGE

  // ==========================================

  const guardarFoto = () => {

    if (!usuario?.id) {

      setErrorFoto("No se encontró una sesión de usuario activa.");

      return;

    }

    try {

      const usuarios = JSON.parse(

        localStorage.getItem("essalud_usuarios") || "[]",

      );

      const existeUsuario = usuarios.some((item) => item.id === usuario.id);

      if (!existeUsuario) {

        setErrorFoto("No se encontró tu cuenta registrada.");

        return;

      }

      const usuariosActualizados = usuarios.map((item) =>

        item.id === usuario.id ? { ...item, fotoPerfil: fotoTemporal } : item,

      );

      const usuarioActualizado = {

        ...usuario,

        fotoPerfil: fotoTemporal,

      };

      localStorage.setItem(

        "essalud_usuarios",

        JSON.stringify(usuariosActualizados),

      );

      localStorage.setItem(

        "essalud_usuario_activo",

        JSON.stringify(usuarioActualizado),

      );

      setFotoPerfil(fotoTemporal);

      setModalFotoAbierto(false);

      setFotoEliminada(false);

      setErrorFoto("");

    } catch (error) {

      console.error("Error al guardar la foto:", error);

      setErrorFoto(

        "No se pudo guardar la foto. Prueba con una imagen más pequeña.",

      );

    }

  };

  // ==========================================

  // CANCELAR EDICIÓN DE FOTO

  // ==========================================

  const cancelarEdicionFoto = () => {

    setFotoTemporal(fotoPerfil);

    setFotoEliminada(false);

    setErrorFoto("");

    setModalFotoAbierto(false);

  };

  // ==========================================

  // NAVEGACIÓN INFERIOR

  // ==========================================

  const navegarMenu = (id) => {

    const rutas = {

      inicio: "/essalud/inicio",

      citas: "/essalud/citas",

      chat: "/essalud/chat",

      perfil: "/essalud/perfil",

    };

    if (rutas[id]) {

      navigate(rutas[id]);

    }

  };

  // ==========================================

  // RENDERIZADO

  // ==========================================

  return (

    <main

      className={`appointments-screen perfil-screen tema-${tema} contraste-${contraste} texto-${tamanoTexto}`}

    >

      {/* ENCABEZADO */}

      <header className="appointments-header">

        <button

          type="button"

          className="appointments-back"

          onClick={() => navigate("/essalud/inicio")}

          aria-label="Volver al inicio"

        >

          <ArrowLeft size={23} />

        </button>

        <h1>Mi perfil</h1>

        <img

          src={logoEssalud}

          alt="EsSalud Digital"

          className="appointments-logo"

        />

        <button

          className="reservar-help"

          type="button"

          aria-label="Ayuda"

          onClick={() =>

            window.alert("Aquí puedes consultar la información de tu perfil.")

          }

        >

          <CircleHelp size={18} />

        </button>

      </header>

      {/* CONTENIDO DEL PERFIL */}

      <div className="perfil-content">

        {/* INFORMACIÓN DEL ASEGURADO */}

        <section className="perfil-user-card">

          <div className="perfil-avatar-container">

            <div className="perfil-avatar">

              {fotoPerfil ? (

                <img src={fotoPerfil} alt="Foto de perfil" />

              ) : usuario?.avatar ? (

                <span className="perfil-avatar-emoji">{usuario.avatar}</span>

              ) : (

                <UserRound size={42} strokeWidth={1.7} />

              )}

            </div>

            <button

              type="button"

              className="perfil-avatar-edit"

              onClick={abrirModalFoto}

              aria-label="Editar foto de perfil"

              title="Editar foto de perfil"

            >

              <Pencil size={15} />

            </button>

          </div>

          <div className="perfil-user-info">

            <h2>{usuario?.nombres || "Usuario"}</h2>

            <p>

              <ShieldCheck size={16} />

              Asegurado de EsSalud

            </p>

            <span className="perfil-status">

              <ShieldCheck size={14} />

              Asegurado activo

            </span>

          </div>

        </section>

        {/* MIS DATOS PERSONALES */}

        <button

          type="button"

          className="perfil-option-card"

          onClick={() => navigate("/essalud/datos-personales")}

        >

          <div className="perfil-option-icon">

            <UserRound size={23} />

          </div>

          <div className="perfil-option-info">

            <h3>Mis datos personales</h3>

            <p>Consulta y actualiza tu información</p>

          </div>

          <ChevronRight size={21} />

        </button>

        {/* SEGURIDAD */}

        <button

          type="button"

          className="perfil-option-card"

          onClick={() => navigate("/essalud/seguridad")}

        >

          <div className="perfil-option-icon">

            <LockKeyhole size={23} />

          </div>

          <div className="perfil-option-info">

            <h3>Seguridad de mi cuenta</h3>

            <p>Cambia tu contraseña y protege tu cuenta</p>

          </div>

          <ChevronRight size={21} />

        </button>

        {/* ACCESIBILIDAD */}

        <section className="perfil-access-card">

          <button

            type="button"

            className="perfil-access-header"

            onClick={() => setAccesibilidadAbierta(!accesibilidadAbierta)}

            aria-expanded={accesibilidadAbierta}

          >

            <div className="perfil-option-icon">

              <Accessibility size={25} />

            </div>

            <div className="perfil-option-info">

              <h3>Accesibilidad e inclusión</h3>

              <p>Personaliza tu experiencia</p>

            </div>

            {accesibilidadAbierta ? (

              <ChevronUp size={21} />

            ) : (

              <ChevronRight size={21} />

            )}

          </button>

          {accesibilidadAbierta && (

            <div className="perfil-access-content">

              {/* SONIDO */}

              <div className="perfil-access-row">

                <div className="perfil-access-icon">

                  <Volume2 size={21} />

                </div>

                <div className="perfil-access-info">

                  <h4>Sonido de la aplicación</h4>

                  <p>Alertas y notificaciones sonoras</p>

                </div>

                <button

                  type="button"

                  className={`perfil-switch ${sonido ? "active" : ""}`}

                  role="switch"

                  aria-checked={sonido}

                  aria-label="Activar sonido"

                  onClick={() => setSonido(!sonido)}

                >

                  <span />

                </button>

              </div>

              {/* LECTURA EN VOZ ALTA */}

              <div className="perfil-access-row">

                <div className="perfil-access-icon">

                  <Volume2 size={21} />

                </div>

                <div className="perfil-access-info">

                  <h4>Lectura en voz alta</h4>

                  <p>Compatibilidad con lectores de pantalla</p>

                </div>

                <button

                  type="button"

                  className={`perfil-switch ${lecturaVoz ? "active" : ""}`}

                  role="switch"

                  aria-checked={lecturaVoz}

                  aria-label="Activar lectura en voz alta"

                  onClick={() => setLecturaVoz(!lecturaVoz)}

                >

                  <span />

                </button>

              </div>

              {/* CONTRASTE */}

              <div className="perfil-access-row">

                <div className="perfil-access-icon">

                  <Contrast size={21} />

                </div>

                <div className="perfil-access-info">

                  <h4>Contraste</h4>

                  <p>Mejora la visibilidad del contenido</p>

                </div>

                <div

                  className="perfil-segmented"

                  role="group"

                  aria-label="Nivel de contraste"

                >

                  <button

                    type="button"

                    className={contraste === "normal" ? "active" : ""}

                    aria-pressed={contraste === "normal"}

                    onClick={() => setContraste("normal")}

                  >

                    Normal

                  </button>

                  <button

                    type="button"

                    className={contraste === "alto" ? "active" : ""}

                    aria-pressed={contraste === "alto"}

                    onClick={() => setContraste("alto")}

                  >

                    Alto

                  </button>

                </div>

              </div>

              {/* TEMA */}

              <div className="perfil-access-row">

                <div className="perfil-access-icon">

                  <Sun size={21} />

                </div>

                <div className="perfil-access-info">

                  <h4>Tema de visualización</h4>

                  <p>Elige el estilo de la aplicación</p>

                </div>

                <div

                  className="perfil-segmented theme-options"

                  role="group"

                  aria-label="Tema de visualización"

                >

                  <button

                    type="button"

                    className={tema === "claro" ? "active" : ""}

                    onClick={() => setTema("claro")}

                    aria-label="Tema claro"

                    aria-pressed={tema === "claro"}

                  >

                    <Sun size={15} />

                  </button>

                  <button

                    type="button"

                    className={tema === "oscuro" ? "active" : ""}

                    onClick={() => setTema("oscuro")}

                    aria-label="Tema oscuro"

                    aria-pressed={tema === "oscuro"}

                  >

                    <Moon size={15} />

                  </button>

                </div>

              </div>

              {/* TAMAÑO DEL TEXTO */}

              <div className="perfil-access-row">

                <div className="perfil-access-icon">

                  <Type size={22} />

                </div>

                <div className="perfil-access-info">

                  <h4>Tamaño del texto</h4>

                  <p>Ajusta el tamaño del contenido</p>

                </div>

                <div

                  className="perfil-segmented text-size-options"

                  role="group"

                  aria-label="Tamaño del texto"

                >

                  <button

                    type="button"

                    className={tamanoTexto === "pequeno" ? "active" : ""}

                    onClick={() => setTamanoTexto("pequeno")}

                    aria-label="Texto pequeño"

                    aria-pressed={tamanoTexto === "pequeno"}

                  >

                    A

                  </button>

                  <button

                    type="button"

                    className={tamanoTexto === "medio" ? "active" : ""}

                    onClick={() => setTamanoTexto("medio")}

                    aria-label="Texto mediano"

                    aria-pressed={tamanoTexto === "medio"}

                  >

                    A

                  </button>

                  <button

                    type="button"

                    className={tamanoTexto === "grande" ? "active" : ""}

                    onClick={() => setTamanoTexto("grande")}

                    aria-label="Texto grande"

                    aria-pressed={tamanoTexto === "grande"}

                  >

                    A

                  </button>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* AYUDA Y SOPORTE */}

        <button

          type="button"

          className="perfil-option-card"

          onClick={() => navigate("/essalud/ayuda")}

        >

          <div className="perfil-option-icon">

            <CircleHelp size={23} />

          </div>

          <div className="perfil-option-info">

            <h3>Ayuda y soporte</h3>

            <p>Preguntas frecuentes y canales de atención</p>

          </div>

          <ChevronRight size={21} />

        </button>

      </div>

      {/* MODAL DE FOTO DE PERFIL */}

      {modalFotoAbierto && (

        <div

          className="foto-modal-overlay"

          onMouseDown={(e) => {

            if (e.target === e.currentTarget) {

              cancelarEdicionFoto();

            }

          }}

        >

          <section

            className="foto-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="foto-modal-title"

          >

            <div className="foto-modal-header">

              <div>

                <span className="foto-modal-eyebrow">

                  PERSONALIZA TU CUENTA

                </span>

                <h2 id="foto-modal-title">Foto de perfil</h2>

              </div>

              <button

                type="button"

                className="foto-modal-close"

                onClick={cancelarEdicionFoto}

                aria-label="Cerrar ventana"

              >

                <X size={21} />

              </button>

            </div>

            <div className="foto-modal-body">

              <div className="foto-preview-container">

                <div className="foto-preview">

                  {fotoTemporal ? (

                    <img src={fotoTemporal} alt="Vista previa de perfil" />

                  ) : (

                    <UserRound size={66} strokeWidth={1.4} />

                  )}

                </div>

                <span className="foto-preview-camera">

                  <Camera size={19} />

                </span>

              </div>

              <h3>

                {fotoTemporal ? "Tu foto de perfil" : "Agrega una fotografía"}

              </h3>

              <p className="foto-modal-description">

                {fotoTemporal

                  ? "Esta imagen será la que se muestre en tu perfil."

                  : "Sube una fotografía para personalizar tu cuenta de EsSalud Digital."}

              </p>

              <button

                type="button"

                className="foto-upload-button"

                onClick={() => inputFotoRef.current?.click()}

              >

                {fotoTemporal ? (

                  <>

                    <ImagePlus size={19} />

                    Cambiar fotografía

                  </>

                ) : (

                  <>

                    <Upload size={19} />

                    Subir fotografía

                  </>

                )}

              </button>

              <input

                ref={inputFotoRef}

                type="file"

                accept="image/jpeg,image/png,image/webp"

                hidden

                onChange={seleccionarFoto}

              />

              {fotoTemporal && (

                <button

                  type="button"

                  className="foto-delete-button"

                  onClick={eliminarFoto}

                >

                  <Trash2 size={17} />

                  Eliminar fotografía

                </button>

              )}

              {errorFoto && (

                <div className="foto-modal-error" role="alert">

                  {errorFoto}

                </div>

              )}

              <div className="foto-modal-hint">

                <ShieldCheck size={17} />

                <span>Formatos JPG, PNG o WEBP. Tamaño máximo: 2 MB.</span>

              </div>

            </div>

            <div className="foto-modal-footer">

              <button

                type="button"

                className="foto-cancel-button"

                onClick={cancelarEdicionFoto}

              >

                Cancelar

              </button>

              <button

                type="button"

                className="foto-save-button"

                onClick={guardarFoto}

                disabled={!fotoTemporal && !fotoEliminada}

              >

                <Check size={18} />

                Guardar cambios

              </button>

            </div>

          </section>

        </div>

      )}

      {/* NAVEGACIÓN INFERIOR */}

      <BottomNavigation active="perfil" onNavigate={navegarMenu} />

    </main>

  );

}
