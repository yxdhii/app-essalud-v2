import React from "react";
import HomeHeader from "../components/HomeHeader";
import SearchBar from "../components/SearchBar";
import NextAppointment from "../components/NextAppointment";
import ServicesGrid from "../components/ServicesGrid";
import OnlineAttention from "../components/OnlineAttention";
import BottomNavigation from "../components/BottomNavigation";

export default function EsSaludHome() {
  // Datos del usuario activo
  const user = {
    name: "María Guadalupe",
    gender: "female",
  };

  return (
    <main className="essalud-home">
      {/* Encabezado, logo y bienvenida */}
      <HomeHeader user={user} />

      {/* Contenido principal */}
      <div className="home-content">
        {/* Buscador de servicios */}
        <SearchBar />

        {/* Próxima cita médica */}
        <NextAppointment />

        {/* Accesos a los servicios */}
        <ServicesGrid />

        {/* Atención médica en línea */}
        <OnlineAttention gender={user.gender} />
      </div>

      {/* Navegación inferior */}
      <BottomNavigation active="inicio" />
    </main>
  );
}