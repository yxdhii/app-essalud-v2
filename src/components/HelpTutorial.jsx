import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, CircleHelp } from "lucide-react";

const steps = [
  {
    target: "dni",
    title: "Número de documento",
    description:
      "Ingresa tu número de DNI de 8 dígitos para identificar tu cuenta.",
  },
  {
    target: "password",
    title: "Tu contraseña",
    description:
      "Escribe tu contraseña. Puedes utilizar el icono del ojo para mostrarla u ocultarla.",
  },
  {
    target: "forgot",
    title: "Recuperar contraseña",
    description:
      "¿Olvidaste tu contraseña? Selecciona esta opción para conocer el proceso de recuperación.",
  },
  {
    target: "register",
    title: "Crear cuenta",
    description:
      "Si todavía no tienes una cuenta, pulsa el botón resaltado para comenzar tu registro en EsSalud Digital.",
  },
];

function HelpTutorial({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [targetFound, setTargetFound] = useState(false);

  const updatePosition = useCallback(() => {
    if (!isOpen) return;

    const currentTarget = steps[currentStep].target;

    const target = document.querySelector(`[data-tour="${currentTarget}"]`);

    if (!target) {
      setTargetRect(null);
      setTargetFound(false);
      return;
    }

    setTargetFound(true);

    // Desplazar el elemento para que sea visible.
    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });

    // Esperar a que termine el desplazamiento.
    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();

      setTargetRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });

      const margin = 12;
      const gap = 14;
      const cardWidth = Math.min(350, window.innerWidth - 28);
      const cardHeight = Math.min(300, window.innerHeight - 24);

      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top;

      // Si es el paso Crear cuenta, priorizar la parte superior.
      if (currentTarget === "register") {
        top = rect.top - cardHeight - gap;

        // Evitar que la tarjeta salga de la pantalla.
        if (top < margin) {
          top = margin;
        }
      } else if (spaceBelow >= cardHeight + gap) {
        top = rect.bottom + gap;
      } else if (spaceAbove >= cardHeight + gap) {
        top = rect.top - cardHeight - gap;
      } else {
        top = Math.max(
          margin,
          Math.min(
            rect.top - cardHeight - gap,
            window.innerHeight - cardHeight - margin,
          ),
        );
      }

      top = Math.max(
        margin,
        Math.min(top, window.innerHeight - cardHeight - margin),
      );

      setTooltipStyle({
        position: "fixed",
        top: `${top}px`,
        left: "50%",
        transform: "translateX(-50%)",
        width: `${cardWidth}px`,
        maxHeight: `${cardHeight}px`,
      });
    });
  }, [isOpen, currentStep]);

  // Reiniciar el tutorial al abrirlo.
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Actualizar el enfoque al cambiar de paso.
  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(updatePosition);

    const handleResize = () => updatePosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
      }

      if (event.key === "ArrowLeft") {
        setCurrentStep((step) => Math.max(step - 1, 0));
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updatePosition, onClose]);

  if (!isOpen) return null;

  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // No oscurecer el exterior del celular.
  // Las capas oscuras se limitan al contenido de la pantalla.
  const phoneScreen = document.querySelector(".phone-screen-content");
  const phoneRect = phoneScreen?.getBoundingClientRect();

  const phoneRadius = phoneScreen
    ? parseFloat(getComputedStyle(phoneScreen).borderTopLeftRadius) || 40
    : 40;

  const shadePanels =
    targetRect && phoneRect
      ? [
          // Parte superior del contenido del celular.
          {
            top: phoneRect.top,
            left: phoneRect.left,
            width: phoneRect.width,
            height: Math.max(0, targetRect.top - phoneRect.top),
          },

          // Parte inferior del contenido del celular.
          {
            top: targetRect.bottom,
            left: phoneRect.left,
            width: phoneRect.width,
            height: Math.max(0, phoneRect.bottom - targetRect.bottom),
          },

          // Lado izquierdo del objetivo.
          {
            top: targetRect.top,
            left: phoneRect.left,
            width: Math.max(0, targetRect.left - phoneRect.left),
            height: targetRect.height,
          },

          // Lado derecho del objetivo.
          {
            top: targetRect.top,
            left: targetRect.right,
            width: Math.max(0, phoneRect.right - targetRect.right),
            height: targetRect.height,
          },
        ]
      : [];

  return (
    <div className="help-tour">
      {/* Oscurecimiento con espacio libre alrededor del objetivo */}
      <div
        className="help-tour-shade-container"
        style={{
          position: "fixed",
          top: `${phoneRect?.top ?? 0}px`,
          left: `${phoneRect?.left ?? 0}px`,
          width: `${phoneRect?.width ?? 0}px`,
          height: `${phoneRect?.height ?? 0}px`,
          borderRadius: "48px",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 10000,
        }}
      >
        {shadePanels.map((panel, index) => (
          <div
            key={index}
            className="help-tour-shade"
            style={{
              position: "absolute",
              top: `${panel.top - (phoneRect?.top ?? 0)}px`,
              left: `${panel.left - (phoneRect?.left ?? 0)}px`,
              width: `${panel.width}px`,
              height: `${panel.height}px`,
            }}
          />
        ))}
      </div>

      {/* Marco de enfoque */}
      {targetRect && (
        <div
          className="help-tour-spotlight"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        />
      )}

      {/* Tarjeta de instrucciones */}
      <section
        className="help-tour-card"
        style={tooltipStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-tour-title"
      >
        <button
          type="button"
          className="help-tour-close"
          onClick={onClose}
          aria-label="Cerrar tutorial"
        >
          <X size={20} />
        </button>

        <div className="help-tour-icon">
          <CircleHelp size={28} />
        </div>

        <p className="help-tour-step">
          PASO {currentStep + 1} DE {steps.length}
        </p>

        <div className="help-tour-progress">
          {steps.map((step, index) => (
            <span
              key={step.target}
              className={index <= currentStep ? "active" : ""}
            />
          ))}
        </div>

        <h2 id="help-tour-title">{current.title}</h2>

        <p className="help-tour-description">
          {targetFound
            ? current.description
            : `No se encontró el elemento "${current.title}". Verifica su atributo data-tour en EsSaludLogin.jsx.`}
        </p>

        <div className="help-tour-actions">
          <button type="button" className="help-tour-skip" onClick={onClose}>
            Omitir todo
          </button>

          {currentStep > 0 && (
            <button
              type="button"
              className="help-tour-back"
              onClick={() => setCurrentStep((step) => step - 1)}
            >
              <ChevronLeft size={17} />
              Anterior
            </button>
          )}

          <button
            type="button"
            className="help-tour-next"
            onClick={() => {
              if (isLastStep) {
                onClose();
              } else {
                setCurrentStep((step) => step + 1);
              }
            }}
          >
            {isLastStep ? "Finalizar" : "Siguiente"}

            {!isLastStep && <ChevronRight size={18} />}
          </button>
        </div>
      </section>
    </div>
  );
}

export default HelpTutorial;
