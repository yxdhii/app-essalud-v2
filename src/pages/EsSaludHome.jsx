
import React, { useEffect, useMemo } from "react";

import HomeHeader from "../components/HomeHeader";
import SearchBar from "../components/SearchBar";
import NextAppointment from "../components/NextAppointment";
import ServicesGrid from "../components/ServicesGrid";
import OnlineAttention from "../components/OnlineAttention";
import BottomNavigation from "../components/BottomNavigation";
import HealthTip from "../components/HealthTip";

import {
  obtenerUsuarioActivo,
  obtenerFamiliaresVinculados,
} from "../services/usuariosService.js";

import { usePaciente } from "../context/PacienteContext";

export default function EsSaludHome() {
  // Usuario que inició sesión.
  const titular = useMemo(
    () => obtenerUsuarioActivo(),
    []
  );

  // Familiares vinculados al titular.
  const familiares = useMemo(
    () =>
      titular
        ? obtenerFamiliaresVinculados(titular.dni)
        : [],
    [titular]
  );

  const {
    pacienteSeleccionado,
    sincronizarPaciente,
  } = usePaciente();

  // Recuperar el perfil seleccionado.
  useEffect(() => {
    if (titular) {
      sincronizarPaciente(titular, familiares);
    }
  }, []);

  // Paciente cuya información se visualizará.
  const pacienteActual = pacienteSeleccionado || titular;

  return (
    <main className="essalud-home">
      <HomeHeader
        user={pacienteActual}
        titular={titular}
      />

      <div className="home-content">
        <SearchBar />

        <HealthTip />

        <OnlineAttention />

        <ServicesGrid />

        <NextAppointment />
      </div>

      <BottomNavigation />
    </main>
  );
}
