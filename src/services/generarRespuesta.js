
import { conocimientoRecetas } from "../data/conocimientoRecetas.js";

// Busca una receta según el tema mencionado por el usuario.
function buscarReceta(texto) {
  const pregunta = texto.toLowerCase();

  const palabrasClave = {
    "caso-01": [
      "resfriado",
      "gripe",
      "congestion",
      "congestión",
      "paracetamol"
    ],
    "caso-02": [
      "rinitis",
      "alergia",
      "alergica",
      "alérgica",
      "loratadina",
      "estornudos"
    ],
    "caso-05": [
      "gastritis",
      "reflujo",
      "omeprazol",
      "acidez",
      "alginato"
    ]
  };

  return conocimientoRecetas.find((receta) =>
    palabrasClave[receta.id]?.some((palabra) =>
      pregunta.includes(palabra)
    )
  );
}

// Genera respuestas utilizando la información de las recetas.
export function buscarRespuestaReceta(texto) {
  const pregunta = texto.toLowerCase();
  const receta = buscarReceta(texto);

  if (!receta) {
    return null;
  }

  if (
    pregunta.includes("diagnostico") ||
    pregunta.includes("diagnóstico") ||
    pregunta.includes("que tengo") ||
    pregunta.includes("qué tengo") ||
    pregunta.includes("que significa") ||
    pregunta.includes("qué significa")
  ) {
    return `${receta.nombre}: ${receta.diagnostico}`;
  }

  if (
    pregunta.includes("medicamento") ||
    pregunta.includes("medicina") ||
    pregunta.includes("para que sirve") ||
    pregunta.includes("para qué sirve")
  ) {
    return receta.medicamentos
      .map(
        (medicamento) =>
          `${medicamento.nombre}: ${medicamento.uso}`
      )
      .join("\n\n");
  }

  if (
    pregunta.includes("dosis") ||
    pregunta.includes("como tomar") ||
    pregunta.includes("cómo tomar") ||
    pregunta.includes("cada cuanto") ||
    pregunta.includes("cada cuánto")
  ) {
    return receta.medicamentos
      .map(
        (medicamento) =>
          `${medicamento.nombre}: ${medicamento.indicacion}`
      )
      .join("\n\n");
  }

  if (
    pregunta.includes("precaucion") ||
    pregunta.includes("precaución") ||
    pregunta.includes("cuidado") ||
    pregunta.includes("contraindicacion") ||
    pregunta.includes("contraindicación")
  ) {
    return receta.medicamentos
      .map(
        (medicamento) =>
          `${medicamento.nombre}: ${medicamento.precauciones}`
      )
      .join("\n\n");
  }

  if (
    pregunta.includes("alarma") ||
    pregunta.includes("emergencia") ||
    pregunta.includes("peligro") ||
    pregunta.includes("cuando debo preocuparme") ||
    pregunta.includes("cuándo debo preocuparme")
  ) {
    return receta.alertas.join("\n\n");
  }

  if (
    pregunta.includes("cuidado") ||
    pregunta.includes("recomendacion") ||
    pregunta.includes("recomendación") ||
    pregunta.includes("que puedo hacer") ||
    pregunta.includes("qué puedo hacer")
  ) {
    return receta.cuidados.join("\n");
  }

  // Si identifica el caso, pero no el tema específico,
  // presenta un resumen general.
  return `${receta.nombre}\n\n${receta.diagnostico}\n\nMedicamentos del caso:\n${receta.medicamentos
    .map((medicamento) => `• ${medicamento.nombre}`)
    .join("\n")}\n\nPuedes preguntarme por el diagnóstico, los medicamentos, las indicaciones o los cuidados.`;
}
