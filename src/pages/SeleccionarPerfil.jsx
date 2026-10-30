import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  X,
  UserRound,
  UsersRound,
  Plus,
  ChevronRight,
  House,
  CircleHelp,
  Check,
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

  // Obtener los familiares vinculados al usuario que inició sesión.
  const familiares = obtenerFamiliaresVinculados(usuario?.dni);

  // Perfil del titular de la cuenta.
  const titular = {
    id: usuario?.id,
    dni: usuario?.dni || "",
    nombres: usuario?.nombres || "Usuario",
    relation: "Titular",
    avatar: usuario?.avatar || null,
    sexo: usuario?.sexo || null,
    color: "#DCEEFF",
    esTitular: true,
  };

  // Unir el titular con sus familiares.
  const perfiles = [
    titular,
    ...familiares.map((familiar) => ({
      ...familiar,
      esTitular: false,
    })),
  ];

  // Filtrar perfiles por nombre, DNI o parentesco.
  const perfilesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return perfiles;
    }

    return perfiles.filter((perfil) => {
      const nombre = String(perfil.nombres || "").toLowerCase();
      const dni = String(perfil.dni || "");
      const parentesco = String(perfil.relation || "").toLowerCase();

      return (
        nombre.includes(termino) ||
        dni.includes(termino) ||
        parentesco.includes(termino)
      );
    });
  }, [busqueda, usuario, familiares]);

  // Navegar al perfil seleccionado.
  const seleccionarPerfil = (perfil) => {
    if (perfil.esTitular) {
      navigate("/essalud/inicio");
      return;
    }

    navigate(`/essalud/familiar/${encodeURIComponent(perfil.dni)}`, {
      state: { paciente: perfil },
    });
  };

  return (
    <main className="appointments-screen seleccionar-perfil-page">
      {/* ENCABEZADO REUTILIZADO DE MIS CITAS */}
      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/inicio")}
          aria-label="Volver al inicio"
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
              "Selecciona tu perfil o el de uno de tus familiares vinculados para continuar.",
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <section className="seleccionar-perfil-content">
        {/* PRESENTACIÓN */}
        <div className="perfil-intro">
          <div className="perfil-intro-icon">
            <UsersRound size={28} />
          </div>

          <h2>¿Para quién necesitas atención?</h2>

          <p>Selecciona tu perfil o el de uno de tus familiares vinculados.</p>
        </div>

        {/* BUSCADOR */}
        <form
          className="perfil-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search className="perfil-search-icon" size={21} aria-hidden="true" />

          <input
            type="search"
            placeholder="Buscar por nombre o DNI"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            aria-label="Buscar perfiles por nombre o DNI"
          />

          {busqueda && (
            <button
              className="perfil-search-clear"
              type="button"
              onClick={() => setBusqueda("")}
              aria-label="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </form>

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
              className={`perfil-card ${
                perfil.esTitular ? "perfil-card-titular" : ""
              }`}
              key={perfil.dni || `perfil-${index}`}
              onClick={() => seleccionarPerfil(perfil)}
            >
              {/* AVATAR */}
              <span
                className="perfil-avatar"
                style={{
                  backgroundColor: perfil.color || "#DCEEFF",
                }}
              >
                {perfil.avatar || <UserRound size={25} strokeWidth={1.8} />}
              </span>

              {/* INFORMACIÓN DEL PERFIL */}
              <span className="perfil-card-info">
                <strong>{perfil.nombres || "Sin nombre"}</strong>

                <span className="perfil-card-description">
                  {perfil.relation || "Familiar"}
                  {perfil.dni ? ` · DNI ${perfil.dni}` : ""}
                </span>

                {perfil.esTitular && (
                  <span className="perfil-titular-badge">Tu cuenta</span>
                )}
              </span>

              {/* INDICADOR DEL PERFIL */}
              {perfil.esTitular ? (
                <span
                  className="perfil-card-check"
                  aria-label="Cuenta titular"
                  title="Tu cuenta"
                >
                  <Check size={17} strokeWidth={3} />
                </span>
              ) : (
                <ChevronRight
                  size={21}
                  className="perfil-card-arrow"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        {/* ESTADO SIN RESULTADOS */}
        {perfilesFiltrados.length === 0 && (
          <div className="perfil-empty">
            <UsersRound size={35} />

            <h3>No encontramos perfiles</h3>

            <p>Prueba con otro nombre o número de DNI.</p>
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
