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
  UserRound,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import ConfirmacionModal from "./ConfirmacionModal";

import { obtenerFamiliaresVinculados } from "../services/usuariosService.js";

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
  const [activeItem, setActiveItem] = useState("Inicio");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  const nombreUsuario = user?.nombres || user?.name || "Usuario";
  const dniUsuario = String(user?.dni || "");

  // Cargar los familiares vinculados al titular actual
  const cargarFamiliares = () => {
    const familiares = obtenerFamiliaresVinculados(dniUsuario);

    setFamilyMembers(Array.isArray(familiares) ? familiares : []);
  };

  useEffect(() => {
    cargarFamiliares();
  }, [dniUsuario]);

  // Datos del titular
  const titular = {
    id: user?.id,
    dni: dniUsuario,
    name: nombreUsuario,
    nombres: nombreUsuario,
    relation: "Titular",
    avatar: user?.avatar || null,
    color: "#d8edff",
  };

  // El titular aparece primero y luego los familiares
  const profiles = [
    titular,
    ...familyMembers.map((familiar) => ({
      ...familiar,
      name: familiar.nombres || familiar.name || "Familiar",
    })),
  ];

  // Mostrar como máximo tres perfiles
  const visibleProfiles = profiles.slice(0, 3);

  // Navegación del menú lateral
  const handleNavigate = (label) => {
    setActiveItem(label);

    const rutas = {
      Inicio: "/essalud/inicio",
      "Mis citas": "/essalud/citas",
      Recetas: "/essalud/recetas",
      "Mis exámenes": "/essalud/examenes",
      "Descansos médicos": "/essalud/descansos-medicos",
      Referencias: "/essalud/referencias",
      TeleEduca: "/essalud/teleeduca",
      "Riesgo de diabetes tipo 2": "/essalud/riesgo-diabetes",

      Familiares: "/essalud/familiares",
      "Mis familiares": "/essalud/familiares",
      "Agregar familiar": "/essalud/agregar-familiar",
      "Cambiar de cuenta": "/essalud/cambiar-cuenta",
      "Mi perfil": "/essalud/perfil",
    };

    if (onNavigate) {
      onNavigate(label);
    }

    if (rutas[label]) {
      navigate(rutas[label]);
    }

    onClose();
  };

  // Seleccionar un perfil familiar
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile.dni);

    if (onNavigate) {
      onNavigate("Perfil familiar", {
        paciente: profile,
      });
    }

    onClose();
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
          <div className="sidebar-avatar">
            {user?.avatar || <UserRound size={28} strokeWidth={1.8} />}
          </div>

          <div className="sidebar-profile-info">
            <strong>{nombreUsuario}</strong>

            <span>DNI: {dniUsuario || "No disponible"}</span>

            <span className="sidebar-profile-link">
              Ver mi perfil <ChevronRight size={13} />
            </span>
          </div>
        </button>

        {/* PERFILES */}
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
                {profile.avatar || <UserRound size={22} strokeWidth={1.8} />}
              </span>

              <span className="sidebar-family-info">
                <strong>{profile.name}</strong>
                <small>{profile.relation}</small>
              </span>

              <ChevronRight size={17} className="sidebar-family-arrow" />
            </button>
          ))}

          {/* ACCESO A TODOS LOS FAMILIARES */}
          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Familiares")}
          >
            <span className="sidebar-add-icon">
              <Users size={20} strokeWidth={1.8} />
            </span>

            <span className="sidebar-add-info">
              <strong>Familiares</strong>
              <small>Consultar y administrar familiares</small>
            </span>

            <ChevronRight size={17} className="sidebar-add-arrow" />
          </button>

          {/* AGREGAR FAMILIAR */}
          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Agregar familiar")}
          >
            <span className="sidebar-add-icon">
              <Plus size={20} strokeWidth={1.8} />
            </span>

            <span className="sidebar-add-info">
              <strong>Agregar familiar</strong>
              <small>Vincula a un asegurado</small>
            </span>

            <ChevronRight size={17} className="sidebar-add-arrow" />
          </button>

          {/* CAMBIAR DE CUENTA */}
          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Cambiar de cuenta")}
          >
            <span className="sidebar-add-icon">
              <Users size={20} strokeWidth={1.8} />
            </span>

            <span className="sidebar-add-info">
              <strong>Cambiar de cuenta</strong>
              <small>Inicia sesión con otro titular</small>
            </span>

            <ChevronRight size={17} className="sidebar-add-arrow" />
          </button>
        </section>

        {/* NAVEGACIÓN PRINCIPAL */}
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

        {/* CONFIRMAR CIERRE DE SESIÓN */}
        <ConfirmacionModal
          isOpen={showLogoutConfirm}
          title="¿Estás seguro de cerrar sesión?"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            onClose();

            if (onLogout) {
              onLogout();
            }

            navigate("/essalud/gestionar-cuentas", {
              replace: true,
            });
          }}
        />
      </aside>
    </div>
  );
}
