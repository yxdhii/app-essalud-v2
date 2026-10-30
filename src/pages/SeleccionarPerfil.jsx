
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  UserRound,
  UsersRound,
  Plus,
  ChevronRight,
  House,
  CircleHelp,
} from "lucide-react";

import logoEssalud from "../assets/digital-logo.png";

import {
  obtenerUsuarioActivo,
  obtenerFamiliaresVinculados,
} from "../services/usuariosService.js";

export default function SeleccionarPerfil() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const [busqueda, setBusqueda] = useState("");

  const familiares = obtenerFamiliaresVinculados(usuario?.dni);

  const titular = {
    id: usuario?.id,
    dni: usuario?.dni || "",
    nombres: usuario?.nombres || "Usuario",
    relation: "Titular",
    avatar: "👤",
    color: "#DCEEFF",
    esTitular: true,
  };

  const perfiles = [
    titular,
    ...familiares.map((familiar) => ({
      ...familiar,
      esTitular: false,
    })),
  ];

  const perfilesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return perfiles;

    return perfiles.filter(
      (perfil) =>
        String(perfil.nombres || "")
          .toLowerCase()
          .includes(termino) ||
        String(perfil.dni || "").includes(termino) ||
        String(perfil.relation || "")
          .toLowerCase()
          .includes(termino)
    );
  }, [busqueda, usuario, familiares]);

  const seleccionarPerfil = (perfil) => {
    if (perfil.esTitular) {
      navigate("/essalud/inicio");
      return;
    }

    navigate(
      `/essalud/familiar/${encodeURIComponent(perfil.dni)}`,
      {
        state: { paciente: perfil },
      }
    );
  };

  return (
    <main className="appointments-screen seleccionar-perfil-page">

      {/* ENCABEZADO REUTILIZADO DE MIS CITAS */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate(-1)}
          aria-label="Regresar"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Seleccionar perfil</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          className="reservar-help"
          type="button"
          aria-label="Ayuda"
          onClick={() =>
            window.alert(
              "Selecciona tu perfil o el de uno de tus familiares vinculados para continuar."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}
      <section className="seleccionar-perfil-content">

        <div className="perfil-intro">
          <div className="perfil-intro-icon">
            <UsersRound size={28} />
          </div>

          <h2>¿Para quién necesitas atención?</h2>

          <p>
            Selecciona tu perfil o el de uno de tus familiares vinculados.
          </p>
        </div>

        {/* BUSCADOR */}
        <label className="perfil-search">
          <Search size={20} />

          <input
            type="search"
            placeholder="Buscar por nombre o DNI"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </label>

        {/* TÍTULO Y CANTIDAD */}
        <div className="perfil-section-heading">
          <h3>Perfiles disponibles</h3>
          <span>{perfilesFiltrados.length}</span>
        </div>

        {/* LISTA DE PERFILES */}
        <div className="perfil-list">
          {perfilesFiltrados.map((perfil, index) => (
            <button
              type="button"
              className="perfil-card"
              key={perfil.dni || `perfil-${index}`}
              onClick={() => seleccionarPerfil(perfil)}
            >
              <span
                className="perfil-avatar"
                style={{
                  backgroundColor: perfil.color || "#DCEEFF",
                }}
              >
                {perfil.avatar || <UserRound size={25} />}
              </span>

              <span className="perfil-card-info">
                <strong>{perfil.nombres || "Sin nombre"}</strong>

                <span>
                  {perfil.relation || "Familiar"}
                  {perfil.dni ? ` · DNI ${perfil.dni}` : ""}
                </span>

                {perfil.esTitular && (
                  <span className="perfil-titular-badge">
                    Tu cuenta
                  </span>
                )}
              </span>

              <ChevronRight
                size={21}
                className="perfil-card-arrow"
              />
            </button>
          ))}
        </div>

        {/* SIN RESULTADOS */}
        {perfilesFiltrados.length === 0 && (
          <div className="perfil-empty">
            <UsersRound size={35} />

            <h3>No encontramos perfiles</h3>

            <p>
              Prueba con otro nombre o número de DNI.
            </p>
          </div>
        )}

        {/* AGREGAR FAMILIAR */}
        <button
          type="button"
          className="perfil-add-button"
          onClick={() => navigate("/essalud/agregar-familiar")}
        >
          <Plus size={21} />
          Agregar familiar
        </button>

        {/* VOLVER AL INICIO */}
        <button
          type="button"
          className="perfil-home-button"
          onClick={() => navigate("/essalud/inicio")}
        >
          <House size={19} />
          Volver al inicio
        </button>

      </section>
    </main>
  );
}
