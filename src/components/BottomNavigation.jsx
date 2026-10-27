import React from "react";
import {
  House,
  CalendarCheck,
  FileText,
  UserRound,
} from "lucide-react";

const items = [
  {
    id: "inicio",
    label: "Inicio",
    icon: House,
  },
  {
    id: "citas",
    label: "Mis citas",
    icon: CalendarCheck,
  },
  {
    id: "recetas",
    label: "Recetas",
    icon: FileText,
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: UserRound,
  },
];

export default function BottomNavigation({ active = "inicio" }) {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Navegación principal"
    >
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;

        return (
          <button
            key={id}
            type="button"
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            onClick={() => {
              console.log(`Sección seleccionada: ${label}`);
            }}
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