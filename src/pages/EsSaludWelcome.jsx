import { useNavigate } from "react-router-dom";
import welcomeImage from "../assets/essalud-welcome.png";

function EsSaludWelcome() {
  const navigate = useNavigate();

  return (
    <main className="essalud-welcome">
      {/* Imagen principal: logo, eslogan y doctora */}
      <section className="essalud-welcome-hero">
        <img
          src={welcomeImage}
          alt="EsSalud Digital: tu salud, más cerca de ti"
          className="essalud-welcome-image"
        />
      </section>

      {/* Tarjeta inferior de bienvenida */}
      <section className="essalud-welcome-card">
        <h1>Accede a tu cuenta</h1>

        <p>
          Gestiona tus citas, revisa tus resultados
          <br />y más, desde un solo lugar.
        </p>

        {/* Botones de acceso */}
        <div className="essalud-welcome-actions">
          <button
            type="button"
            className="essalud-welcome-login"
            onClick={() => navigate("/essalud/login")}
          >
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.1 0-7.5 2.1-7.5 4.7V21h15v-2.3c0-2.6-3.4-4.7-7.5-4.7Z" />
            </svg>

            <span>Iniciar sesión</span>
          </button>

          <button
            type="button"
            className="essalud-welcome-register"
            onClick={() => navigate("/essalud/registro")}
          >
            Crear cuenta
          </button>
        </div>
      </section>
    </main>
  );
}

export default EsSaludWelcome;
