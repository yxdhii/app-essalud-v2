import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CircleHelp,
  Search,
  MapPin,
  Hospital,
  Navigation,
  ChevronRight,
  X,
  Building2,
  MapPinned,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";
import logoEssalud from "../assets/digital-logo.png";

export default function CentrosAtencion() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("Todos");

  // Datos de demostración para el prototipo.
  const centros = [
    {
      id: 1,
      nombre: "Hospital Nacional Edgardo Rebagliati Martins",
      tipo: "Hospitales",
      direccion: "Av. Edgardo Rebagliati, Jesús María, Lima",
    },
    {
      id: 2,
      nombre: "Hospital Nacional Guillermo Almenara Irigoyen",
      tipo: "Hospitales",
      direccion: "Av. Grau, La Victoria, Lima",
    },
    {
      id: 3,
      nombre: "Policlínico Chincha",
      tipo: "Policlínicos",
      direccion: "Jesús María, Lima",
    },
    {
      id: 4,
      nombre: "Centro Médico de Atención Primaria",
      tipo: "Centros médicos",
      direccion: "Dirección por confirmar",
    },
  ];

  const filtros = [
    { nombre: "Todos", icono: Building2 },
    { nombre: "Hospitales", icono: Hospital },
    { nombre: "Centros médicos", icono: Building2 },
    { nombre: "Policlínicos", icono: MapPinned },
  ];

  // Filtrar los establecimientos por nombre, tipo o dirección.
  const centrosFiltrados = centros.filter((centro) => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    const coincideBusqueda = [
      centro.nombre,
      centro.tipo,
      centro.direccion,
    ]
      .join(" ")
      .toLowerCase()
      .includes(textoBusqueda);

    const coincideFiltro =
      filtroActivo === "Todos" || centro.tipo === filtroActivo;

    return coincideBusqueda && coincideFiltro;
  });

  // Navegación inferior.
  const navegarMenu = (id) => {
    if (id === "inicio") navigate("/essalud/inicio");
    if (id === "citas") navigate("/essalud/citas");
    if (id === "recetas") navigate("/essalud/recetas");
    if (id === "perfil") navigate("/essalud/perfil");
  };

  // Abrir la ubicación en Google Maps.
  const buscarEnMapa = (centro) => {
    const consulta = encodeURIComponent(
      `${centro.nombre}, ${centro.direccion}`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${consulta}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Limpiar el buscador y restablecer los filtros.
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroActivo("Todos");
  };

  return (
    <main className="appointments-screen centers-page">
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

        <h1>Centros de atención</h1>

        <img
          src={logoEssalud}
          alt="EsSalud Digital"
          className="appointments-logo"
        />

        <button
          type="button"
          className="reservar-help"
          aria-label="Ayuda"
          onClick={() =>
            window.alert(
              "Busca hospitales, policlínicos y centros médicos por nombre o distrito."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}
      <div className="centers-content">
        {/* BUSCADOR */}
        <form
          className="centers-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={21} aria-hidden="true" />

          <input
            type="search"
            placeholder="Buscar por nombre o distrito..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            aria-label="Buscar centros de atención"
          />

          {busqueda && (
            <button
              type="button"
              className="centers-clear"
              onClick={() => setBusqueda("")}
              aria-label="Limpiar búsqueda"
            >
              <X size={17} />
            </button>
          )}
        </form>

        {/* FILTROS */}
        <div
          className="centers-filters"
          role="group"
          aria-label="Filtrar establecimientos"
        >
          {filtros.map((filtro) => {
            const IconoFiltro = filtro.icono;

            return (
              <button
                key={filtro.nombre}
                type="button"
                className={
                  filtroActivo === filtro.nombre
                    ? "centers-filter active"
                    : "centers-filter"
                }
                aria-pressed={filtroActivo === filtro.nombre}
                onClick={() => setFiltroActivo(filtro.nombre)}
              >
                <IconoFiltro size={16} />
                <span>{filtro.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* RESULTADOS */}
        <section className="centers-results">
          <div className="centers-results-heading">
            <div>
              <h2>Establecimientos</h2>
              <p>
                {busqueda.trim()
                  ? "Resultados de tu búsqueda"
                  : "Encuentra tu centro de atención"}
              </p>
            </div>

            <span>{centrosFiltrados.length}</span>
          </div>

          {centrosFiltrados.length > 0 ? (
            <div className="centers-list">
              {centrosFiltrados.map((centro) => (
                <article className="center-card" key={centro.id}>
                  <div className="center-card-top">
                    <div className="center-icon">
                      <Hospital size={24} />
                    </div>

                    <span className="center-type">{centro.tipo}</span>
                  </div>

                  <h3>{centro.nombre}</h3>

                  <p className="center-address">
                    <MapPin size={17} aria-hidden="true" />
                    <span>{centro.direccion}</span>
                  </p>

                  <button
                    type="button"
                    className="center-location-button"
                    onClick={() => buscarEnMapa(centro)}
                  >
                    <Navigation size={17} />
                    <span>Ver ubicación</span>
                    <ChevronRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="centers-empty">
              <div className="centers-empty-icon">
                <Search size={28} />
              </div>

              <h3>No encontramos resultados</h3>

              <p>
                Prueba con otro nombre, distrito o tipo de establecimiento.
              </p>

              <button type="button" onClick={limpiarFiltros}>
                Limpiar búsqueda
              </button>
            </div>
          )}

          <p className="centers-disclaimer">
            Datos de demostración para el prototipo. Verifica la información
            antes de acudir.
          </p>
        </section>
      </div>
    </main>
  );
}