
import essaludLogo from "../assets/digital-logo1.png";

export default function LoadingOverlay({
  message = "Validando tus datos...",
}) {
  return (
    <div className="essalud-loading-overlay">
      <div className="essalud-loading-content">
        <img
          src={essaludLogo}
          alt="EsSalud Digital"
          className="essalud-loading-logo"
        />

        <div
          className="essalud-loading-spinner"
          role="progressbar"
          aria-label={message}
        />

        <p className="essalud-loading-text">{message}</p>
      </div>
    </div>
  );
}
