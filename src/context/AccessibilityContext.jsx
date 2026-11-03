
import { createContext, useContext, useEffect, useState } from "react";

const AccessibilityContext = createContext(null);

const PREFERENCIAS_INICIALES = {
  tema: "claro",
  contraste: "normal",
  tamanoTexto: "medio",
};

export function AccessibilityProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("essalud-tema") || "claro";
    } catch {
      return "claro";
    }
  });

  const [contraste, setContraste] = useState(() => {
    try {
      return localStorage.getItem("essalud-contraste") || "normal";
    } catch {
      return "normal";
    }
  });

  const [tamanoTexto, setTamanoTexto] = useState(() => {
    try {
      return localStorage.getItem("essalud-tamano-texto") || "medio";
    } catch {
      return "medio";
    }
  });

  // Aplicar preferencias globalmente
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove(
      "tema-claro",
      "tema-oscuro",
      "contraste-normal",
      "contraste-alto",
      "texto-pequeno",
      "texto-medio",
      "texto-grande"
    );

    root.classList.add(
      `tema-${tema}`,
      `contraste-${contraste}`,
      `texto-${tamanoTexto}`
    );

    root.setAttribute("data-theme", tema);
    root.setAttribute("data-contrast", contraste);
    root.setAttribute("data-font-size", tamanoTexto);

    try {
      localStorage.setItem("essalud-tema", tema);
      localStorage.setItem("essalud-contraste", contraste);
      localStorage.setItem("essalud-tamano-texto", tamanoTexto);
    } catch {
      console.warn("No se pudieron guardar las preferencias.");
    }
  }, [tema, contraste, tamanoTexto]);

  const aumentarTexto = () => {
    setTamanoTexto((actual) => {
      if (actual === "pequeno") return "medio";
      if (actual === "medio") return "grande";
      return "grande";
    });
  };

  const disminuirTexto = () => {
    setTamanoTexto((actual) => {
      if (actual === "grande") return "medio";
      if (actual === "medio") return "pequeno";
      return "pequeno";
    });
  };

  const restablecerAccesibilidad = () => {
    setTema(PREFERENCIAS_INICIALES.tema);
    setContraste(PREFERENCIAS_INICIALES.contraste);
    setTamanoTexto(PREFERENCIAS_INICIALES.tamanoTexto);
  };

  const value = {
    tema,
    setTema,
    contraste,
    setContraste,
    tamanoTexto,
    setTamanoTexto,
    aumentarTexto,
    disminuirTexto,
    restablecerAccesibilidad,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility debe utilizarse dentro de AccessibilityProvider"
    );
  }

  return context;
}
