
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CircleHelp,
  Search,
  CalendarDays,
  Users,
  UserPlus,
  FileText,
  FlaskConical,
  Hospital,
  ClipboardList,
  GraduationCap,
  Activity,
  HeartPulse,
  BriefcaseMedical,
  UserRound,
  ChevronRight,
  X,
} from "lucide-react";

import BottomNavigation from "../components/BottomNavigation";

import logoEssalud from "../assets/digital-logo.png";

export default function TodosServicios() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");

  // ============================================
  // SERVICIOS DISPONIBLES
  // ============================================

  const categorias = [
    {
      id: "atencion",
      titulo: "Atención médica",
      descripcion: "Gestiona tus atenciones y perfiles.",
      servicios: [
        {
          id: "citas",
          nombre: "Mis citas",
          descripcion: "Consulta y gestiona tus citas médicas.",
          icono: CalendarDays,
          color: "blue",
          ruta: "/essalud/citas",
        },
        {
          id: "familiares",
          nombre: "Mis familiares",
          descripcion: "Consulta y administra los perfiles de tu familia.",
          icono: Users,
          color: "blue",
          ruta: "/essalud/gestionar-familiares",
        },
        {
          id: "agregar-familiar",
          nombre: "Agregar familiar",
          descripcion: "Vincula a un asegurado a tu cuenta.",
          icono: UserPlus,
          color: "blue",
          ruta: "/essalud/agregar-familiar",
        },
        {
          id: "centros",
          nombre: "Centros de atención",
          descripcion: "Busca hospitales, policlínicos y establecimientos.",
          icono: Hospital,
          color: "pink",
          ruta: "/essalud/centros-atencion",
        },
        {
          id: "referencias",
          nombre: "Referencias",
          descripcion: "Consulta la información de tus referencias médicas.",
          icono: ClipboardList,
          color: "blue",
          ruta: "/essalud/referencias",
        },
      ],
    },
    {
      id: "informacion",
      titulo: "Información médica",
      descripcion: "Accede a tus documentos y resultados.",
      servicios: [
        {
          id: "recetas",
          nombre: "Recetas",
          descripcion: "Consulta tus recetas médicas.",
          icono: FileText,
          color: "purple",
          ruta: "/essalud/recetas",
        },
        {
          id: "examenes",
          nombre: "Mis exámenes",
          descripcion: "Revisa tus resultados de laboratorio.",
          icono: FlaskConical,
          color: "blue",
          ruta: "/essalud/examenes",
        },
        {
          id: "descansos",
          nombre: "Descansos médicos",
          descripcion: "Consulta tus descansos médicos registrados.",
          icono: BriefcaseMedical,
          color: "pink",
          ruta: "/essalud/descansos-medicos",
        },
      ],
    },
    {
      id: "bienestar",
      titulo: "Prevención y bienestar",
      descripcion: "Encuentra información para cuidar tu salud.",
      servicios: [
        {
          id: "teleeduca",
          nombre: "TeleEduca",
          descripcion: "Accede a contenidos educativos sobre salud.",
          icono: GraduationCap,
          color: "purple",
          ruta: "/essalud/teleeduca",
        },
        {
          id: "diabetes",
          nombre: "Riesgo de diabetes tipo 2",
          descripcion: "Consulta la evaluación de riesgo de diabetes.",
          icono: Activity,
          color: "pink",
          ruta: "/essalud/riesgo-diabetes",
        },
        {
          id: "consejos",
          nombre: "Consejos de salud",
          descripcion: "Descubre recomendaciones para tu bienestar.",
          icono: HeartPulse,
          color: "green",
          ruta: "/essalud/consejos-salud",
        },
      ],
    },
    {
      id: "cuenta",
      titulo: "Gestión de cuenta",
      descripcion: "Administra tus perfiles y tu información.",
      servicios: [
        {
          id: "cambiar-cuenta",
          nombre: "Cambiar de cuenta",
          descripcion: "Inicia sesión con otro titular.",
          icono: UserRound,
          color: "blue",
          ruta: "/essalud/gestionar-cuentas",
        },
        {
          id: "perfil",
          nombre: "Mi perfil",
          descripcion: "Consulta y actualiza tus datos personales.",
          icono: UserRound,
          color: "purple",
          ruta: "/essalud/perfil",
        },
      ],
    },
  ];

  // ============================================
  // FILTRAR SERVICIOS
  // ============================================

  const categoriasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return categorias;

    return categorias
      .map((categoria) => ({
        ...categoria,
        servicios: categoria.servicios.filter((servicio) =>
          `${servicio.nombre} ${servicio.descripcion}`
            .toLowerCase()
            .includes(termino)
        ),
      }))
      .filter((categoria) => categoria.servicios.length > 0);
  }, [busqueda]);

  const totalServicios = categorias.reduce(
    (total, categoria) =>
      total + categoria.servicios.length,
    0
  );

  // ============================================
  // ABRIR SERVICIO
  // ============================================

  const abrirServicio = (ruta) => {
    navigate(ruta);
  };

  // ============================================
  // NAVEGACIÓN INFERIOR
  // ============================================

  const navegarMenu = (id) => {
    const rutas = {
      inicio: "/essalud/inicio",
      citas: "/essalud/citas",
      chat: "/essalud/chat",
      perfil: "/essalud/perfil",
    };

    if (rutas[id]) {
      navigate(rutas[id]);
    }
  };

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <main className="appointments-screen all-services-screen">

      {/* ENCABEZADO: MISMAS CLASES DE MIS CITAS */}

      <header className="appointments-header">
        <button
          type="button"
          className="appointments-back"
          onClick={() => navigate("/essalud/inicio")}
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={23} />
        </button>

        <h1>Todos los servicios</h1>

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
              "Desde esta sección puedes encontrar y acceder a los servicios disponibles de EsSalud Digital."
            )
          }
        >
          <CircleHelp size={18} />
        </button>
      </header>

      {/* CONTENIDO */}

      <div className="all-services-content">

        {/* PRESENTACIÓN */}

        <section className="all-services-intro">
          <div>
            <h2>¿Qué necesitas hoy?</h2>

            <p>
              Encuentra fácilmente los servicios de EsSalud Digital.
            </p>
          </div>

          <span className="all-services-count">
            {totalServicios} servicios
          </span>
        </section>

        {/* BUSCADOR */}

        <div className="all-services-search">
          <Search size={21} />

          <input
            type="text"
            placeholder="Buscar servicios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar servicios"
          />

          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              aria-label="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* CATEGORÍAS */}

        <div className="all-services-categories">

          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map((categoria) => (
              <section
                className="all-services-section"
                key={categoria.id}
              >
                <div className="all-services-section-heading">
                  <div>
                    <h2>{categoria.titulo}</h2>
                    <p>{categoria.descripcion}</p>
                  </div>

                  <span>
                    {categoria.servicios.length}
                  </span>
                </div>

                <div className="all-services-grid">
                  {categoria.servicios.map((servicio) => {
                    const Icono = servicio.icono;

                    return (
                      <button
                        type="button"
                        className="all-service-card"
                        key={servicio.id}
                        onClick={() =>
                          abrirServicio(servicio.ruta)
                        }
                      >
                        <div
                          className={`all-service-icon ${servicio.color}`}
                        >
                          <Icono size={24} strokeWidth={1.9} />
                        </div>

                        <div className="all-service-info">
                          <h3>{servicio.nombre}</h3>

                          <p>{servicio.descripcion}</p>
                        </div>

                        <ChevronRight
                          className="all-service-arrow"
                          size={20}
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <section className="all-services-empty">
              <div>
                <Search size={30} />
              </div>

              <h3>No encontramos servicios</h3>

              <p>
                Intenta buscar con otro nombre o palabra.
              </p>

              <button
                type="button"
                onClick={() => setBusqueda("")}
              >
                Ver todos los servicios
              </button>
            </section>
          )}

        </div>
      </div>


    </main>
  );
}
