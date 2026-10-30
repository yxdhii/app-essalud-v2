import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronRight,
  Plus,
  House,
  CalendarDays,
  FileText,
  FlaskConical,
  ClipboardList,
  Files,
  Monitor,
  ShieldCheck,
  LogOut,
  Users,
  Trash2,
  UserRound,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";

import {
  obtenerFamiliaresVinculados,
  desvincularFamiliar,
} from "../services/usuariosService.js";

const menuItems = [
  { label: "Inicio", icon: House },
  { label: "Mis citas", icon: CalendarDays },
  { label: "Recetas", icon: FileText },
  { label: "Mis exámenes", icon: FlaskConical },
  { label: "Descansos médicos", icon: ClipboardList },
  { label: "Referencias", icon: Files },
  { label: "TeleEduca", icon: Monitor },
  { label: "Riesgo de diabetes tipo 2", icon: ShieldCheck },
];

export default function HomeSidebar({
  isOpen,
  onClose,
  user = { name: "Usuario", dni: "" },
  onNavigate,
  onLogout,
}) {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAllProfiles, setShowAllProfiles] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(null);
  const [activeItem, setActiveItem] = useState("Inicio");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [message, setMessage] = useState("");

  const nombreUsuario = user?.nombres || user?.name || "Usuario";

  const dniUsuario = String(user?.dni || "");

  // Cargar únicamente los familiares del titular actual.
  const cargarFamiliares = () => {
    const familiares = obtenerFamiliaresVinculados(dniUsuario);
    setFamilyMembers(familiares);
  };

  useEffect(() => {
    cargarFamiliares();
  }, [dniUsuario]);

  // Perfil del titular.
  const titular = {
    id: user?.id,
    dni: dniUsuario,
    name: nombreUsuario,
    nombres: nombreUsuario,
    relation: "Titular",
    avatar: "👩🏻",
    color: "#d8edff",
  };

  // El titular siempre aparece primero.
  const profiles = [
    titular,
    ...familyMembers.map((familiar) => ({
      ...familiar,
      name: familiar.nombres,
    })),
  ];

  const selectedProfileData =
    profiles.find((profile) => profile.dni === selectedProfile) || titular;

  const visibleProfiles = showAllProfiles ? profiles : profiles.slice(0, 3);

  const handleNavigate = (label) => {
    setActiveItem(label);

    const rutas = {
      Inicio: "/essalud/inicio",
      "Mis familiares": "/essalud/familiares",
      "Agregar familiar": "/essalud/agregar-familiar",
      "Cambiar de cuenta": "/essalud/cambiar-cuenta",
      "Mi perfil": "/essalud/perfil",
      "Mis citas": "/essalud/citas",
    };

    if (onNavigate) {
      onNavigate(label);
    }

    if (rutas[label]) {
      navigate(rutas[label]);
    }

    onClose();
  };

  // Seleccionar un paciente sin iniciar sesión en su cuenta personal.
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile.dni);
    setMessage(`Perfil seleccionado: ${profile.name}.`);

    /*
     * Notificamos a la pantalla principal qué perfil se seleccionó.
     * Para cambiar los datos médicos mostrados, el componente padre
     * debe manejar este evento y filtrar los datos por paciente.
     */
    if (onNavigate) {
      onNavigate("Perfil familiar", {
        paciente: profile,
      });
    }

    onClose();
  };

  const handleUnlink = () => {
    if (!showUnlinkConfirm) return;

    const resultado = desvincularFamiliar(showUnlinkConfirm.dni);

    setMessage(resultado.mensaje);

    if (resultado.correcto) {
      if (selectedProfile === showUnlinkConfirm.dni) {
        setSelectedProfile(null);
      }

      cargarFamiliares();
    }

    setShowUnlinkConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar-overlay" onClick={onClose} role="presentation">
      <aside
        className="home-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Menú lateral de EsSalud Digital"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ENCABEZADO */}
        <div className="sidebar-header">
          <img
            src={logoEssalud}
            alt="EsSalud Digital"
            className="sidebar-logo"
          />

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        {/* PERFIL DEL TITULAR */}
        <button
          type="button"
          className="sidebar-profile"
          onClick={() => handleNavigate("Mi perfil")}
        >
          <div className="sidebar-avatar">👩🏻</div>

          <div className="sidebar-profile-info">
            <strong>{nombreUsuario}</strong>

            <span>DNI: {dniUsuario || "No disponible"}</span>

            <span className="sidebar-profile-link">
              Ver mi perfil <ChevronRight size={13} />
            </span>
          </div>
        </button>

        {/* PERFILES FAMILIARES */}
        <section className="sidebar-accounts">
          <h3>Mis perfiles</h3>

          {visibleProfiles.map((profile) => (
            <button
              type="button"
              className={`sidebar-family-member ${
                selectedProfile === profile.dni ? "selected" : ""
              }`}
              key={profile.dni}
              onClick={() => handleSelectProfile(profile)}
            >
              <span
                className="sidebar-family-avatar"
                style={{
                  backgroundColor: profile.color || "#d8edff",
                }}
              >
                {profile.avatar || "👤"}
              </span>

              <span className="sidebar-family-info">
                <strong>{profile.name}</strong>
                <small>{profile.relation}</small>
              </span>

              <ChevronRight size={17} className="sidebar-family-arrow" />
            </button>
          ))}

          {/* VER TODOS LOS PERFILES */}
          {profiles.length > 3 && (
            <button
              type="button"
              className="sidebar-add-account"
              onClick={() => setShowAllProfiles((prev) => !prev)}
            >
              <span className="sidebar-add-icon">
                <Users size={19} />
              </span>

              <span>
                {showAllProfiles ? "Mostrar menos" : "Ver todos los perfiles"}
              </span>
            </button>
          )}

          {/* FAMILIARES */}
          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Mis familiares")}
          >
            <span className="sidebar-add-icon">
              <Users size={20} />
            </span>

            <span>
              <strong>Familiares</strong>
              <small style={{ display: "block" }}>
                Ver todos los familiares
              </small>
            </span>

            <ChevronRight size={17} />
          </button>

          {/* AGREGAR FAMILIAR */}
          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Agregar familiar")}
          >
            <span className="sidebar-add-icon">
              <Plus size={20} />
            </span>

            <span>
              <strong>Agregar familiar</strong>
              <small style={{ display: "block" }}>Vincula a un asegurado</small>
            </span>
          </button>

          {/* CAMBIAR DE CUENTA */}
          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Cambiar de cuenta")}
          >
            <span className="sidebar-add-icon">
              <Users size={20} />
            </span>

            <span>
              <strong>Cambiar de cuenta</strong>
              <small style={{ display: "block" }}>
                Inicia sesión con otro titular
              </small>
            </span>

            <ChevronRight size={17} />
          </button>

          {/* ADMINISTRAR FAMILIARES */}
          {familyMembers.length > 0 && (
            <div style={{ padding: "8px 12px" }}>
              <button
                type="button"
                onClick={() => handleNavigate("Mis familiares")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#1769aa",
                  padding: "8px 0",
                  textAlign: "left",
                }}
              >
                <UserRound size={17} />
                <span>Administrar mis familiares</span>
              </button>
            </div>
          )}
        </section>

        {/* ACCIÓN PARA DESVINCULAR */}
        {selectedProfileData.relation !== "Titular" && (
          <div style={{ padding: "0 12px 12px" }}>
            <button
              type="button"
              onClick={() => setShowUnlinkConfirm(selectedProfileData)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "10px",
                border: "1px solid #f2caca",
                borderRadius: "8px",
                background: "#fff7f7",
                color: "#b42318",
                cursor: "pointer",
              }}
            >
              <Trash2 size={16} />
              Desvincular perfil seleccionado
            </button>
          </div>
        )}

        {/* NAVEGACIÓN */}
        <nav className="sidebar-navigation" aria-label="Navegación principal">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`sidebar-nav-item ${
                activeItem === label ? "active" : ""
              }`}
              onClick={() => handleNavigate(label)}
              aria-current={activeItem === label ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* CERRAR SESIÓN */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={19} strokeWidth={1.8} />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* CONFIRMAR DESVINCULACIÓN */}
        {showUnlinkConfirm && (
          <div
            className="logout-confirm-overlay"
            onClick={() => setShowUnlinkConfirm(null)}
          >
            <div
              className="logout-confirm-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="unlink-confirm-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="unlink-confirm-title">
                ¿Desvincular a {showUnlinkConfirm.nombres}?
              </h2>

              <p>
                Se eliminará el vínculo familiar de tu cuenta. La cuenta
                personal del familiar no será eliminada.
              </p>

              <div className="logout-confirm-actions">
                <button
                  type="button"
                  className="logout-cancel-button"
                  onClick={() => setShowUnlinkConfirm(null)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="logout-accept-button"
                  onClick={handleUnlink}
                >
                  Desvincular
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMAR CIERRE DE SESIÓN */}
        {showLogoutConfirm && (
          <div
            className="logout-confirm-overlay"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              className="logout-confirm-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="logout-confirm-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="logout-confirm-title">¿Estás seguro de cerrar sesión?</h2>

              <div className="logout-confirm-actions">
                <button
                  type="button"
                  className="logout-cancel-button"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  No
                </button>

                <button
                  type="button"
                  className="logout-accept-button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onClose();

                    if (onLogout) {
                      onLogout();
                    }

                    navigate("/essalud/login", {
                      replace: true,
                    });
                  }}
                >
                  Sí
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
