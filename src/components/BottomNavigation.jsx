import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  House,
  CalendarCheck,
  FileText,
  UserRound,
} from "lucide-react";

const items = [
  { id: "inicio", label: "Inicio", icon: House, path: "/essalud/inicio" },
  { id: "citas", label: "Mis citas", icon: CalendarCheck, path: "/essalud/citas" },
  { id: "recetas", label: "Recetas", icon: FileText, path: "/essalud/recetas" },
  { id: "perfil", label: "Perfil", icon: UserRound, path: "/essalud/perfil" },
];

export default function BottomNavigation({ active }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem =
    active ||
    items.find((item) => item.path === location.pathname)?.id ||
    "inicio";

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
            onClick={() => navigate(path)}
          >
            <Icon
              size={23}
              strokeWidth={isActive ? 2.4 : 1.8}
              aria-hidden="true"
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}