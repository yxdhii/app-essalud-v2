import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";
import headerMujer from "../assets/header-mujer.png";
import HomeSidebar from "./HomeSidebar";

export default function HomeHeader({
  user = { name: "María Guadalupe" },
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="home-header">
        <div className="home-header-top">
          <button
            type="button"
            className="header-icon-button"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={23} strokeWidth={1.8} />
          </button>

          <img
            src={logoEssalud}
            alt="EsSalud Digital"
            className="header-logo"
          />

          <button
            type="button"
            className="header-icon-button"
            aria-label="Ver notificaciones"
          >
            <Bell size={22} strokeWidth={1.8} />
            <span className="notification-dot" />
          </button>
        </div>

        <section className="home-welcome">
          <img
            src={headerMujer}
            alt=""
            aria-hidden="true"
            className="welcome-image"
          />

          <div className="welcome-text">
            <span>¡Hola!</span>
            <h1>{user.name}</h1>
            <p>¿Cómo podemos ayudarte hoy?</p>
          </div>
        </section>
      </header>

      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
    </>
  );
}