
export function reproducirAudio(texto, nombreVoz, alFinalizar) {
  if (!texto?.trim()) return;

  if (!("speechSynthesis" in window)) {
    console.error("El navegador no admite reproducción de voz.");
    alFinalizar?.();
    return;
  }

  window.speechSynthesis.cancel();

  const mensaje = new SpeechSynthesisUtterance(texto);
  const voces = window.speechSynthesis.getVoices();

  const vozSeleccionada = voces.find(
    (voz) => voz.name === nombreVoz
  );

  if (vozSeleccionada) {
    mensaje.voice = vozSeleccionada;
    mensaje.lang = vozSeleccionada.lang;
  } else {
    mensaje.lang = "es-ES";
  }

  mensaje.rate = 0.95;
  mensaje.pitch = 1;
  mensaje.volume = 1;

  mensaje.onend = () => alFinalizar?.();
  mensaje.onerror = () => alFinalizar?.();

  window.speechSynthesis.speak(mensaje);
}

export function detenerAudio() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
