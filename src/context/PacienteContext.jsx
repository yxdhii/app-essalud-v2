
import React, {
  createContext,
  useContext,
  useState,
} from "react";

const PacienteContext = createContext(null);

const CLAVE_PACIENTE = "essalud_paciente_seleccionado";

function leerPacienteGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_PACIENTE);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function PacienteProvider({ children }) {
  const [seleccion, setSeleccion] = useState(
    leerPacienteGuardado
  );

  // Cambiar el paciente que se está visualizando.
  // No modifica la sesión del titular.
  const seleccionarPaciente = (paciente, titular) => {
    if (!paciente?.dni || !titular?.dni) return;

    const nuevaSeleccion = {
      dniTitular: String(titular.dni),
      paciente,
    };

    setSeleccion(nuevaSeleccion);

    localStorage.setItem(
      CLAVE_PACIENTE,
      JSON.stringify(nuevaSeleccion)
    );
  };

  // Regresar al perfil del titular.
  const seleccionarTitular = (titular) => {
    if (!titular?.dni) return;

    seleccionarPaciente(titular, titular);
  };

  // Validar que el paciente seleccionado
  // siga perteneciendo al titular autenticado.
  const sincronizarPaciente = (titular, familiares = []) => {
    if (!titular?.dni) return;

    const dniTitular = String(titular.dni);
    const guardado = leerPacienteGuardado();

    if (guardado?.dniTitular === dniTitular) {
      const dniPaciente = String(
        guardado.paciente?.dni || ""
      );

      const pacienteActual =
        dniPaciente === dniTitular
          ? titular
          : familiares.find(
              (f) => String(f.dni) === dniPaciente
            );

      if (pacienteActual) {
        setSeleccion({
          dniTitular,
          paciente: pacienteActual,
        });
        return;
      }
    }

    seleccionarTitular(titular);
  };

  // Limpiar el perfil seleccionado al cerrar sesión.
  const limpiarSeleccion = () => {
    setSeleccion(null);
    localStorage.removeItem(CLAVE_PACIENTE);
  };

  const pacienteSeleccionado = seleccion?.paciente || null;

  return (
    <PacienteContext.Provider
      value={{
        pacienteSeleccionado,
        seleccionarPaciente,
        seleccionarTitular,
        sincronizarPaciente,
        limpiarSeleccion,
      }}
    >
      {children}
    </PacienteContext.Provider>
  );
}

export function usePaciente() {
  const context = useContext(PacienteContext);

  if (!context) {
    throw new Error(
      "usePaciente debe utilizarse dentro de PacienteProvider"
    );
  }

  return context;
}
