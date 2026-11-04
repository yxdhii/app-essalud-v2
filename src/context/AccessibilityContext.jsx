
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AccessibilityContext = createContext(null);

const PREFERENCIAS_INICIALES = {
  tema: "claro",
  contraste: "normal",
  tamanoTexto: "medio",
  lecturaVoz: false,
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

  // Nueva preferencia: lectura en voz alta
  const [lecturaVoz, setLecturaVoz] = useState(() => {
    try {
      return localStorage.getItem("essalud-lectura-voz") === "true";
    } catch {
      return false;
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
      localStorage.setItem("essalud-lectura-voz", String(lecturaVoz));
    } catch {
      console.warn("No se pudieron guardar las preferencias.");
    }
  }, [tema, contraste, tamanoTexto, lecturaVoz]);

  // Aumentar tamaño de texto
  const aumentarTexto = () => {
    setTamanoTexto((actual) => {
      if (actual === "pequeno") return "medio";
      if (actual === "medio") return "grande";
      return "grande";
    });
  };

  // Disminuir tamaño de texto
  const disminuirTexto = () => {
    setTamanoTexto((actual) => {
      if (actual === "grande") return "medio";
      if (actual === "medio") return "pequeno";
      return "pequeno";
    });
  };

  // Leer texto en voz alta
  const leerTexto = useCallback(
    (texto) => {
      if (
        !lecturaVoz ||
        !texto?.trim() ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        return;
      }

      window.speechSynthesis.cancel();

      const mensaje = new SpeechSynthesisUtterance(texto);
      mensaje.lang = "es-PE";
      mensaje.rate = 1;
      mensaje.pitch = 1;
      mensaje.volume = 1;

      const voces = window.speechSynthesis.getVoices();

      const vozEspanol =
        voces.find((voz) => voz.lang.toLowerCase() === "es-pe") ||
        voces.find((voz) => voz.lang.toLowerCase().startsWith("es"));

      if (vozEspanol) {
        mensaje.voice = vozEspanol;
      }

      window.speechSynthesis.speak(mensaje);
    },
    [lecturaVoz]
  );

  // Pausar lectura
  const pausarLectura = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  }, []);

  // Reanudar lectura
  const reanudarLectura = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }
  }, []);

  // Detener lectura
  const detenerLectura = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Si se desactiva la lectura, detener cualquier reproducción
  useEffect(() => {
    if (!lecturaVoz) {
      detenerLectura();
    }
  }, [lecturaVoz, detenerLectura]);

  // Detener lectura al desmontar el proveedor
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Restablecer preferencias
  const restablecerAccesibilidad = () => {
    setTema(PREFERENCIAS_INICIALES.tema);
    setContraste(PREFERENCIAS_INICIALES.contraste);
    setTamanoTexto(PREFERENCIAS_INICIALES.tamanoTexto);
    setLecturaVoz(PREFERENCIAS_INICIALES.lecturaVoz);
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

    // Funciones de lectura en voz alta
    lecturaVoz,
    setLecturaVoz,
    leerTexto,
    pausarLectura,
    reanudarLectura,
    detenerLectura,
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
