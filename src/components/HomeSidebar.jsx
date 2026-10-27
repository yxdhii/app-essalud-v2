import React, { useState } from "react";
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
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";

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

const familyMembers = [
  {
    name: "María Guadalupe",
    relation: "Titular",
    avatar: "👩🏻",
    color: "#d8edff",
  },
  {
    name: "Juan Pérez",
    relation: "Hijo",
    avatar: "👦🏻",
    color: "#f7dce8",
  },
  {
    name: "Ana Pérez",
    relation: "Madre",
    avatar: "👩🏻",
    color: "#ffe5c9",
  },
];

export default function HomeSidebar({
  isOpen,
  onClose,
  user = { name: "María Guadalupe", dni: "12345678" },
  onNavigate,
  onLogout,
}) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeItem, setActiveItem] = useState("Inicio");
  const [selectedAccount, setSelectedAccount] = useState(
    user.name || "María Guadalupe",
  );

  const handleNavigate = (label) => {
    setActiveItem(label);

    if (onNavigate) {
      onNavigate(label);
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

        {/* PERFIL DEL USUARIO */}
        <button
          type="button"
          className="sidebar-profile"
          onClick={() => handleNavigate("Mi perfil")}
        >
          <div className="sidebar-avatar">👩🏻</div>

          <div className="sidebar-profile-info">
            <strong>{user.name}</strong>
            <span>DNI: {user.dni || "12345678"}</span>
            <span className="sidebar-profile-link">
              Ver mi perfil <ChevronRight size={13} />
            </span>
          </div>
        </button>

        {/* CUENTAS FAMILIARES */}
        <section className="sidebar-accounts">
          <h3>Mis cuentas</h3>

          {familyMembers.map((member) => (
            <button
              type="button"
              className={`sidebar-family-member ${
                selectedAccount === member.name ? "selected" : ""
              }`}
              key={member.name}
              onClick={() => setSelectedAccount(member.name)}
            >
              <span
                className="sidebar-family-avatar"
                style={{ backgroundColor: member.color }}
              >
                {member.avatar}
              </span>

              <span className="sidebar-family-info">
                <strong>{member.name}</strong>
                <small>{member.relation}</small>
              </span>

              <ChevronRight size={17} className="sidebar-family-arrow" />
            </button>
          ))}

          <button
            type="button"
            className="sidebar-add-account"
            onClick={() => handleNavigate("Agregar cuenta")}
          >
            <span className="sidebar-add-icon">
              <Plus size={20} />
            </span>
            <span>Agregar cuenta</span>
          </button>
        </section>

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

        {/* VENTANA DE CONFIRMACIÓN */}
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

                    navigate("/essalud/login", { replace: true });
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
