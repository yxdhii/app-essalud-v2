
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configurar el trabajador de PDF.js para Vite.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function analizarDocumento(archivo) {
  if (!archivo) {
    throw new Error("No se ha seleccionado ningún documento.");
  }

  if (archivo.type !== "application/pdf") {
    throw new Error("Por ahora solo podemos analizar documentos PDF.");
  }

  try {
    const datos = await archivo.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(datos),
    }).promise;

    let textoCompleto = "";

    for (let numeroPagina = 1; numeroPagina <= pdf.numPages; numeroPagina++) {
      const pagina = await pdf.getPage(numeroPagina);
      const contenido = await pagina.getTextContent();

      const textoPagina = contenido.items
        .map((elemento) => elemento.str || "")
        .join(" ");

      textoCompleto += `\n${textoPagina}`;
    }

    if (!textoCompleto.trim()) {
      throw new Error(
        "No se encontró texto en el PDF. Puede ser un documento escaneado."
      );
    }

    return {
      nombre: archivo.name,
      paginas: pdf.numPages,
      texto: textoCompleto.trim(),
    };
  } catch (error) {
    console.error("Error al analizar el PDF:", error);
    throw new Error(
      error.message || "No se pudo leer el documento PDF."
    );
  }
}
