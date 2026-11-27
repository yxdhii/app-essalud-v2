
export const conocimientoRecetas = [
  // ==========================================
  // CASO 01: RESFRIADO COMÚN
  // ==========================================
  {
    id: "caso-01",
    nombre: "Resfriado común",

    diagnostico:
      "Tu receta indica como diagnóstico resfriado común. El caso presenta congestión nasal, dolor de garganta leve y malestar general.",

    medicamentos: [
      {
        nombre: "Paracetamol 500 mg",
        uso:
          "El paracetamol es un medicamento analgésico y antipirético. Sirve para aliviar el dolor y reducir la fiebre. Esta explicación es información educativa complementaria.",

        indicacion:
          "Según tu receta, la indicación de ejemplo es 1 tableta por vía oral cada 8 horas si hay dolor o fiebre, hasta por 3 días.",

        precauciones:
          "La receta indica no combinar el paracetamol con otros productos que también contengan paracetamol."
      },
      {
        nombre: "Solución salina nasal 0,9 %",
        uso:
          "Según tu receta, sirve para aliviar la congestión nasal. Es una solución de agua y sal que se utiliza para la limpieza nasal.",

        indicacion:
          "Según tu receta, debe aplicarse por vía nasal siguiendo las instrucciones del envase.",

        precauciones:
          "La receta no especifica precauciones adicionales."
      }
    ],

    cuidados: [
      "Mantener descanso.",
      "Beber líquidos suficientes.",
      "Lavarse las manos."
    ],

    antibioticos:
      "Según tu receta, no se indican antibióticos para el resfriado viral.",

    cuandoAcudir:
      "Según tu receta, debes buscar evaluación médica si presentas fiebre persistente o empeoramiento importante. Si tienes dificultad para respirar o dolor torácico, debes buscar atención de emergencia.",

    alertas: [
      "Dificultad para respirar.",
      "Dolor torácico.",
      "Fiebre persistente.",
      "Empeoramiento importante."
    ],

    fuente:
      "Receta académica 01: páginas 1 y 2."
  },

  // ==========================================
  // CASO 02: RINITIS ALÉRGICA
  // ==========================================
  {
    id: "caso-02",
    nombre: "Rinitis alérgica",

    diagnostico:
      "Tu receta indica como diagnóstico rinitis alérgica. El caso presenta estornudos, picazón nasal y secreción transparente asociados a la exposición al polvo.",

    medicamentos: [
      {
        nombre: "Loratadina 10 mg",
        uso:
          "La loratadina es un medicamento antihistamínico. Se utiliza para aliviar síntomas de alergia como estornudos, picazón nasal y secreción nasal. Esta explicación es información educativa complementaria.",

        indicacion:
          "Según tu receta, la indicación de ejemplo es 1 tableta por vía oral cada 24 horas durante 5 días.",

        precauciones:
          "La receta indica no duplicar la loratadina con otros antihistamínicos sin indicación profesional."
      },
      {
        nombre: "Solución salina nasal 0,9 %",
        uso:
          "Es una solución de agua y sal que se utiliza para la limpieza nasal. La receta indica su uso, pero no detalla expresamente su propósito.",

        indicacion:
          "Según tu receta, debe aplicarse por vía nasal siguiendo las instrucciones del envase.",

        precauciones:
          "La receta no especifica precauciones adicionales."
      }
    ],

    somnolencia:
      "La receta no menciona si la loratadina puede causar sueño. Como información educativa complementaria, aunque generalmente produce poca somnolencia, algunas personas pueden experimentarla.",

    evitar:
      "Según tu receta, debes evitar el polvo y otros desencadenantes identificados, limpiar las superficies con un paño húmedo y evitar el humo.",

    contagio:
      "La receta no aborda expresamente el contagio. Como información educativa complementaria, la rinitis alérgica no es contagiosa, ya que es una reacción alérgica y no una infección.",

    cuidados: [
      "Evitar el polvo y otros desencadenantes identificados.",
      "Limpiar las superficies con un paño húmedo.",
      "Evitar el humo."
    ],

    alertas: [
      "Dificultad respiratoria.",
      "Hinchazón de labios, lengua o garganta."
    ],

    signosAlarma:
      "Según tu receta, los signos de alarma son dificultad respiratoria o hinchazón de labios, lengua o garganta. Ante estos síntomas se requiere atención de emergencia.",

    fuente:
      "Receta académica 02: páginas 1 y 2."
  },

  // ==========================================
  // CASO 05: GASTRITIS Y REFLUJO
  // ==========================================
  {
    id: "caso-05",
    nombre: "Gastritis y reflujo gastroesofágico",

    diagnostico:
      "Tu receta indica gastritis y reflujo gastroesofágico. El caso presenta ardor en la parte superior del abdomen, acidez estomacal y sensación de retorno del contenido del estómago hacia la garganta.",

    medicamentos: [
      {
        nombre: "Omeprazol 20 mg",
        uso:
          "Según tu receta, el omeprazol ayuda a reducir la producción de ácido estomacal.",

        indicacion:
          "Según tu receta, debes tomar 1 cápsula por vía oral cada 24 horas, antes del desayuno, según indicación médica.",

        precauciones:
          "Seguir la indicación médica que aparece en la receta."
      },
      {
        nombre: "Alginato de sodio + antiácidos",
        uso:
          "Según tu receta, ayuda a aliviar temporalmente la acidez y el reflujo.",

        indicacion:
          "Según tu receta, debe utilizarse después de las comidas y antes de acostarse, siguiendo la dosis indicada en el envase o por el profesional de salud.",

        precauciones:
          "Seguir la dosis indicada en el envase o por el profesional de salud. La receta no especifica otras precauciones."
      }
    ],

    cuidados: [
      "Evitar comidas abundantes.",
      "Evitar alimentos grasosos.",
      "Evitar alimentos picantes.",
      "Evitar bebidas gaseosas.",
      "No acostarse inmediatamente después de comer.",
      "Esperar entre 2 y 3 horas antes de dormir después de comer."
    ],

    tiempoParaAcostarse:
      "Según tu receta, debes esperar entre 2 y 3 horas antes de dormir después de comer. También recomienda no acostarse inmediatamente después de las comidas.",

    alimentosEvitar:
      "Según tu receta, debes evitar comidas abundantes, alimentos grasosos, picantes y bebidas gaseosas.",

    alertas: [
      "Vómitos con sangre.",
      "Heces negras.",
      "Dolor abdominal intenso.",
      "Dificultad para tragar.",
      "Pérdida de peso inexplicable."
    ],

    signosAlarma:
      "Según tu receta, los signos de alarma son vómitos con sangre, heces negras, dolor abdominal intenso, dificultad para tragar o pérdida de peso inexplicable.",

    fuente:
      "Receta académica 05: páginas 1 y 2."
  }
];
