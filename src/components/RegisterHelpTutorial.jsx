import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";

import { createPortal } from "react-dom";

import { X, ChevronLeft, ChevronRight, CircleHelp } from "lucide-react";

const steps = [
  {
    target: "documentType",
    title: "Tipo de documento",
    description:
      "Selecciona el tipo de documento con el que te identificarás: DNI o carné de extranjería.",
  },
  {
    target: "documentNumber",
    title: "Número de documento",
    description: (documentType) =>
      documentType === "CE"
        ? "Ingresa tu número de carné de extranjería de 9 dígitos."
        : "Ingresa tu número de DNI de 8 dígitos para identificar tu cuenta.",
  },
  {
    target: "verificationCode",
    title: "Carácter verificador",
    description:
      "Si seleccionaste DNI, ingresa el carácter verificador que aparece en tu documento.",
    conditional: true,
  },
  {
    target: "birthDate",
    title: "Fecha de nacimiento",
    description: "Selecciona tu fecha de nacimiento utilizando el calendario.",
  },
  {
    target: "email",
    title: "Correo electrónico",
    description:
      "Escribe una dirección de correo electrónico válida para tus comunicaciones.",
  },
  {
    target: "phone",
    title: "Número de celular",
    description: "Ingresa tu número de celular de 9 dígitos.",
  },
  {
    target: "continue",
    title: "Continuar",
    description:
      "Cuando hayas completado tus datos personales, pulsa Continuar para pasar al segundo paso del registro.",
  },
];

const securitySteps = [
  {
    target: "password",
    title: "Contraseña",
    description:
      "Crea una contraseña de al menos 8 caracteres, con mayúsculas, minúsculas y números.",
  },
  {
    target: "confirmPassword",
    title: "Confirmar contraseña",
    description:
      "Vuelve a escribir tu contraseña. Ambas contraseñas deben coincidir.",
  },
  {
    target: "acceptTerms",
    title: "Términos y condiciones",
    description:
      "Marca esta casilla para aceptar los Términos y Condiciones de Uso.",
  },
  {
    target: "acceptPrivacy",
    title: "Tratamiento de datos personales",
    description:
      "Marca esta casilla para autorizar el tratamiento de tus datos personales.",
  },
  {
    target: "register",
    title: "Registrarme",
    description:
      "Verifica tus datos y pulsa Registrarme para completar el proceso.",
  },
];

export default function RegisterHelpTutorial({
  onClose,
  documentType = "DNI",
  step = 1,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [phoneRect, setPhoneRect] = useState(null);
  const [cardStyle, setCardStyle] = useState({});
  const activeSteps = step === 2 ? securitySteps : steps;

  const [visibleSteps, setVisibleSteps] = useState(activeSteps);

  const cardRef = useRef(null);
  const frameRef = useRef(null);

  const getPhone = useCallback(() => {
    return document.querySelector(".phone-screen-content");
  }, []);

  const getVisibleSteps = useCallback(() => {
    return activeSteps.filter((item) => {
      if (!item.conditional) return true;

      return document.querySelector(`[data-tour="${item.target}"]`);
    });
  }, [activeSteps]);

  const updatePosition = useCallback(() => {
    const phone = getPhone();

    if (!phone) {
      setTargetRect(null);
      setPhoneRect(null);
      return;
    }

    const phoneBounds = phone.getBoundingClientRect();

    setPhoneRect({
      top: phoneBounds.top,
      left: phoneBounds.left,
      right: phoneBounds.right,
      bottom: phoneBounds.bottom,
      width: phoneBounds.width,
      height: phoneBounds.height,
    });

    const availableSteps = getVisibleSteps();
    setVisibleSteps(availableSteps);

    const safeIndex = Math.min(currentStep, availableSteps.length - 1);

    const current = availableSteps[safeIndex];

    if (!current) return;

    const element = document.querySelector(`[data-tour="${current.target}"]`);

    if (!element) {
      setTargetRect(null);
      return;
    }

    // Resaltar el campo completo, no solamente el input.
    const target = element.closest(".register-field") || element;

    const bounds = target.getBoundingClientRect();

    setTargetRect({
      top: bounds.top,
      left: bounds.left,
      right: bounds.right,
      bottom: bounds.bottom,
      width: bounds.width,
      height: bounds.height,
    });
  }, [currentStep, getPhone, getVisibleSteps]);

  // Medir el campo y la tarjeta después de renderizar.
  useLayoutEffect(() => {
    updatePosition();

    const frame = requestAnimationFrame(() => {
      const phone = getPhone();
      const card = cardRef.current;

      if (!phone || !card) return;

      const phoneBounds = phone.getBoundingClientRect();
      const cardHeight = card.getBoundingClientRect().height;

      const margin = 12;
      const gap = 14;

      const availableHeight = Math.max(100, phoneBounds.height - margin * 2);

      const height = Math.min(cardHeight, availableHeight);

      const availableSteps = getVisibleSteps();
      const current =
        availableSteps[Math.min(currentStep, availableSteps.length - 1)];

      const targetElement = current
        ? document.querySelector(`[data-tour="${current.target}"]`)
        : null;

      const target = targetElement?.closest(".register-field") || targetElement;

      const bounds = target?.getBoundingClientRect();

      let top = phoneBounds.top + (phoneBounds.height - height) / 2;

      if (bounds) {
        const spaceBelow = phoneBounds.bottom - bounds.bottom;
        const spaceAbove = bounds.top - phoneBounds.top;

        if (spaceBelow >= height + gap + margin) {
          top = bounds.bottom + gap;
        } else if (spaceAbove >= height + gap + margin) {
          top = bounds.top - height - gap;
        }
      }

      // La tarjeta siempre queda dentro de la pantalla del teléfono.
      top = Math.max(
        phoneBounds.top + margin,
        Math.min(top, phoneBounds.bottom - height - margin),
      );

      const width = Math.min(
        350,
        phoneBounds.width - 28,
        window.innerWidth - 24,
      );

      const left = Math.max(
        12,
        Math.min(
          phoneBounds.left + (phoneBounds.width - width) / 2,
          window.innerWidth - width - 12,
        ),
      );

      setCardStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: `${height}px`,
        boxSizing: "border-box",
        zIndex: 10002,
        visibility: "visible",
        transform: "none",
      });
    });

    frameRef.current = frame;

    return () => cancelAnimationFrame(frame);
  }, [currentStep, updatePosition, getPhone, getVisibleSteps]);

  // Recalcular al cambiar el tamaño, desplazarse o cambiar el contenido.
  useEffect(() => {
    const handleChange = () => updatePosition();

    window.addEventListener("resize", handleChange);
    window.addEventListener("scroll", handleChange, true);

    const observer = new ResizeObserver(handleChange);

    const phone = getPhone();

    if (phone) observer.observe(phone);

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    const timer = window.setTimeout(handleChange, 100);

    return () => {
      window.removeEventListener("resize", handleChange);
      window.removeEventListener("scroll", handleChange, true);
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [updatePosition, getPhone]);

  // Evitar que el índice apunte a un paso que ya no existe.
  useEffect(() => {
    if (currentStep >= visibleSteps.length && visibleSteps.length > 0) {
      setCurrentStep(visibleSteps.length - 1);
    }
  }, [currentStep, visibleSteps.length]);

  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep((previous) => previous + 1);
    } else {
      onClose();
    }
  };

  const previousStep = () => {
    setCurrentStep((previous) => Math.max(0, previous - 1));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();

      if (event.key === "ArrowRight") {
        setCurrentStep((previous) =>
          Math.min(previous + 1, visibleSteps.length - 1),
        );
      }

      if (event.key === "ArrowLeft") {
        previousStep();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, visibleSteps.length]);

  if (!visibleSteps.length) return null;

  const current = visibleSteps[Math.min(currentStep, visibleSteps.length - 1)];

  if (!current) return null;

  const phone = getPhone();

  if (!phone || !phoneRect) return null;

  const insidePhone = (rect) => {
    if (!rect) return null;

    const top = Math.max(rect.top, phoneRect.top);
    const left = Math.max(rect.left, phoneRect.left);
    const right = Math.min(rect.right, phoneRect.right);
    const bottom = Math.min(rect.bottom, phoneRect.bottom);

    if (right <= left || bottom <= top) return null;

    return { top, left, right, bottom };
  };

  const target = insidePhone(targetRect);

  const shadePanels = target
    ? [
        {
          top: phoneRect.top,
          left: phoneRect.left,
          width: phoneRect.width,
          height: Math.max(0, target.top - phoneRect.top),
        },
        {
          top: target.bottom,
          left: phoneRect.left,
          width: phoneRect.width,
          height: Math.max(0, phoneRect.bottom - target.bottom),
        },
        {
          top: target.top,
          left: phoneRect.left,
          width: Math.max(0, target.left - phoneRect.left),
          height: target.bottom - target.top,
        },
        {
          top: target.top,
          left: target.right,
          width: Math.max(0, phoneRect.right - target.right),
          height: target.bottom - target.top,
        },
      ]
    : [
        {
          top: phoneRect.top,
          left: phoneRect.left,
          width: phoneRect.width,
          height: phoneRect.height,
        },
      ];

  const tutorial = (
    <div className="help-tour">
      {/* Oscurecer únicamente el interior del teléfono. */}
      <div
        className="help-tour-shade-container"
        style={{
          position: "fixed",
          top: `${phoneRect.top}px`,
          left: `${phoneRect.left}px`,
          width: `${phoneRect.width}px`,
          height: `${phoneRect.height}px`,
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
              top: `${panel.top - phoneRect.top}px`,
              left: `${panel.left - phoneRect.left}px`,
              width: `${panel.width}px`,
              height: `${panel.height}px`,
              background: "rgba(11, 27, 49, 0.54)",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* Resaltar el campo completo. */}
      {target && (
        <div
          className="help-tour-spotlight"
          style={{
            position: "fixed",
            top: `${target.top - 3}px`,
            left: `${target.left - 3}px`,
            width: `${target.right - target.left + 6}px`,
            height: `${target.bottom - target.top + 6}px`,
            zIndex: 10001,
            boxSizing: "border-box",
            border: "2px solid #1685ff",
            borderRadius: 13,
            background: "rgba(232, 243, 255, 0.12)",
            boxShadow:
              "0 0 0 3px rgba(22,133,255,.13), 0 0 22px rgba(22,133,255,.23)",
            pointerEvents: "none",
            transition: "all .22s ease",
          }}
        />
      )}

      {/* Tarjeta de ayuda con el diseño original. */}
      <section
        ref={cardRef}
        className="help-tour-card register-help-tour-card"
        style={{
          ...cardStyle,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Tutorial de registro"
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
          PASO {currentStep + 1} DE {visibleSteps.length}
        </p>

        <div className="help-tour-progress">
          {visibleSteps.map((item, index) => (
            <span
              key={item.target}
              className={index <= currentStep ? "active" : ""}
            />
          ))}
        </div>

        <h2>{current.title}</h2>

        <p className="help-tour-description">
          {typeof current.description === "function"
            ? current.description(documentType)
            : current.description}
        </p>

        <div className="help-tour-actions">
          <button type="button" className="help-tour-skip" onClick={onClose}>
            Omitir todo
          </button>

          {currentStep > 0 && (
            <button
              type="button"
              className="help-tour-back"
              onClick={previousStep}
            >
              <ChevronLeft size={17} />
              Anterior
            </button>
          )}

          <button type="button" className="help-tour-next" onClick={nextStep}>
            {currentStep === visibleSteps.length - 1
              ? "Finalizar"
              : "Siguiente"}

            {currentStep < visibleSteps.length - 1 && (
              <ChevronRight size={18} />
            )}
          </button>
        </div>
      </section>
    </div>
  );

  // Mantener el tutorial fuera de los contenedores que puedan recortarlo.
  return createPortal(tutorial, document.body);
}
