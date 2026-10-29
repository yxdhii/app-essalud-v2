import React from "react";
import {
  House,
  CalendarCheck,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { id: "inicio", label: "Inicio", icon: House, path: "/essalud/inicio" },
  { id: "citas", label: "Mis citas", icon: CalendarCheck, path: "/essalud/citas" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/essalud/chat" },
  { id: "perfil", label: "Perfil", icon: UserRound, path: "/essalud/perfil" },
];

export default function BottomNavigation({ active, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = () => {
    if (active !== undefined) return active;

    const path = location.pathname;

    if (path === "/essalud/inicio") return "inicio";
    if (path === "/essalud/citas") return "citas";
    if (path === "/essalud/chat") return "chat";
    if (path === "/essalud/perfil") return "perfil";

    return null;
  };

  const activeItem = getActiveItem();

  const handleNavigation = (id, path) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="bottom-navigation" aria-label="Navegación principal">
      {items.map(({ id, label, icon: Icon, path }) => {
        const isActive = activeItem === id;

        return (
          <button
            key={id}
            type="button"
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            onClick={() => handleNavigation(id, path)}
          >
            <Icon
              size={21}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}