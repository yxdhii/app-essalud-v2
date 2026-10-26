import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import essaludLogo from "../assets/logo-digital.png";

function EsSaludSplash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/essalud/bienvenida", { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="essalud-splash">
      <div className="essalud-splash-content">
        <img
          src={essaludLogo}
          alt="EsSalud Digital"
          className="essalud-splash-logo"
        />

        <p className="essalud-splash-tagline">Tu salud más cerca de ti</p>
      </div>

      <div className="essalud-splash-loading" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}

export default EsSaludSplash;
