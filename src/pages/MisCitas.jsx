import React, { useState } from "react";
import {
  ArrowLeft,
  HelpCircle,
  CalendarPlus,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";
import emptyAppointments from "../assets/empty-appointments.png";

export default function MisCitas() {
  const [activeTab, setActiveTab] = useState("virtuales");
  const navigate = useNavigate();

  return (
    <main className="appointments-screen">
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

        <h1>Mis citas</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          type="button"
          className="appointments-help"
          aria-label="Ayuda"
          onClick={() => alert("Consulta la información de tus citas médicas.")}
        >
          <HelpCircle size={23} />
        </button>
      </header>

      {/* PESTAÑAS */}
      <div className="appointments-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "virtuales"}
          className={activeTab === "virtuales" ? "active" : ""}
          onClick={() => setActiveTab("virtuales")}
        >
          Virtuales
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "presenciales"}
          className={activeTab === "presenciales" ? "active" : ""}
          onClick={() => setActiveTab("presenciales")}
        >
          Presenciales
        </button>
      </div>

      {/* ESTADO VACÍO */}
      <section className="appointments-empty">
        <img
          src={emptyAppointments}
          alt="Ilustración de una profesional de salud"
          className="appointments-empty-image"
        />

        <h2>¡Aún no tienes citas!</h2>

        <p>Aquí aparecerán tus próximas citas médicas cuando las programes.</p>

        <button
          type="button"
          className="appointments-book-button"
          onClick={() => navigate("/essalud/reservar-cita")}
        >
          <CalendarPlus size={18} />
          Reservar una cita
        </button>
      </section>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNavigation
        active="citas"
        onNavigate={(id) => {
          if (id === "inicio") navigate("/essalud/inicio");
          if (id === "citas") navigate("/essalud/citas");
          if (id === "recetas") navigate("/essalud/recetas");
          if (id === "perfil") navigate("/essalud/perfil");
        }}
      />
    </main>
  );
}
