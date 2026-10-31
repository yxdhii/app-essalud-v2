
import html2pdf from "html2pdf.js";

export const descargarReceta = async (elemento, receta) => {
  if (!elemento) {
    window.alert("No se encontró el documento de la receta.");
    return;
  }

  elemento.classList.add("generando-pdf");

  try {
    // Esperar al siguiente ciclo de renderizado
    await new Promise((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    // Esperar a que carguen las imágenes
    const imagenes = Array.from(elemento.querySelectorAll("img"));

    await Promise.all(
      imagenes.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const opciones = {
      margin: [10, 10, 10, 10],
      filename: `Receta_${receta?.id || "medica"}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scrollY: 0,
        windowWidth: 794,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    await html2pdf()
      .set(opciones)
      .from(elemento)
      .save();

  } catch (error) {
    console.error("Error al generar el PDF:", error);
    window.alert(
      "No se pudo descargar la receta. Inténtalo nuevamente."
    );
  } finally {
    elemento.classList.remove("generando-pdf");
  }
};
