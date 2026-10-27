import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import VerificationCharacterModal from "../components/VerificationCharacterModal.jsx";
import RegisterHelpTutorial from "../components/RegisterHelpTutorial";

import {
  ChevronLeft,
  CircleHelp,
  IdCard,
  LockKeyhole,
  Eye,
  EyeOff,
  ChevronRight,
  CalendarDays,
  Mail,
  Phone,
  Info,
  ChevronDown,
  Check,
  Globe,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import logo from "../assets/digital-logo1.png";

export default function EsSaludRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [showRegisterTutorial, setShowRegisterTutorial] = useState(false);

  const [form, setForm] = useState({
    documentType: "DNI",
    documentNumber: "",
    verificationCode: "",
    birthDate: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  // Actualizar campos del formulario
  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // Actualizar fecha de nacimiento
  const handleBirthDate = (date) => {
    setBirthDate(date);

    const formattedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";

    setForm((prev) => ({
      ...prev,
      birthDate: formattedDate,
    }));

    setError("");
  };

  // Validar datos personales y continuar al paso 2
  const continueRegistration = (event) => {
    event.preventDefault();

    if (
      !form.documentNumber.trim() ||
      (form.documentType === "DNI" && !form.verificationCode.trim()) ||
      !form.birthDate ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError("Completa todos los campos.");
      return;
    }

    // Validar DNI
    if (form.documentType === "DNI" && !/^\d{8}$/.test(form.documentNumber)) {
      setError("El DNI debe contener 8 dígitos.");
      return;
    }

    // Validar carné de extranjería
    if (
      form.documentType === "CE" &&
      !/^[a-zA-Z0-9]{5,20}$/.test(form.documentNumber)
    ) {
      setError("Ingresa un número de C.E. válido.");
      return;
    }

    // Validar carácter verificador solamente para DNI
    if (
      form.documentType === "DNI" &&
      !/^[a-zA-Z0-9]$/.test(form.verificationCode)
    ) {
      setError("Ingresa un carácter verificador válido.");
      return;
    }

    // Validar correo electrónico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    // Validar celular
    if (!/^\d{9}$/.test(form.phone)) {
      setError("El celular debe tener 9 dígitos.");
      return;
    }

    setError("");
    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Validar seguridad de la cuenta
  const submitRegistration = (event) => {
    event.preventDefault();

    if (!form.password || !form.confirmPassword) {
      setError("Completa ambos campos de contraseña.");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      setError("Usa mayúsculas, minúsculas y al menos un número.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!form.acceptTerms || !form.acceptPrivacy) {
      setError("Debes aceptar ambas autorizaciones.");
      return;
    }

    setError("Formulario validado. Falta conectar el servicio de registro.");
  };

  return (
    <main className="register-page">
      {/* ENCABEZADO */}
      <header className="essalud-login-header">
        <button
          type="button"
          className="essalud-back-button"
          onClick={() => {
            if (step === 2) {
              setStep(1);
              setError("");

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            } else {
              navigate(-1);
            }
          }}
          aria-label="Volver"
        >
          <ChevronLeft size={25} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          className="essalud-help-button"
          onClick={() => setShowRegisterTutorial(true)}
        >
          <CircleHelp size={21} strokeWidth={2} />
          <span>Ayuda</span>
        </button>
      </header>

      <section className="register-content">
        {/* LOGO */}
        <img src={logo} alt="EsSalud Digital" className="register-logo" />

        <h1>Crear cuenta</h1>

        <p className="register-step">Paso {step} de 2</p>

        {/* INDICADOR DE PROGRESO */}
        <div className="register-progress">
          <div className="progress-item">
            <div className="progress-number active">
              {step === 2 ? <Check size={18} /> : "1"}
            </div>
          </div>

          <div className={`progress-line ${step === 2 ? "completed" : ""}`} />

          <div className="progress-item">
            <div className={`progress-number ${step === 2 ? "active" : ""}`}>
              2
            </div>
          </div>
        </div>

        {/* PASO 1: DATOS PERSONALES */}
        {step === 1 && (
          <form className="register-form" onSubmit={continueRegistration}>
            <div className="register-section-title">
              <h2>Tus datos</h2>
              <p>Ingresa tu información personal.</p>
            </div>

            {/* TIPO DE DOCUMENTO */}
            <div className="register-field" data-tour="documentType">
              <IdCard className="field-icon" size={22} />

              <select
                name="documentType"
                value={form.documentType}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    documentType: event.target.value,
                    documentNumber: "",
                    verificationCode: "",
                  }));

                  setError("");
                }}
                aria-label="Tipo de documento"
              >
                <option value="DNI">D.N.I.</option>
                <option value="CE">C.E.</option>
              </select>

              <ChevronDown className="select-arrow" size={20} />
            </div>

            {/* NÚMERO DE DOCUMENTO */}
            <label className="register-field" data-tour="documentNumber">
              <UserRound className="field-icon" size={22} />

              <input
                name="documentNumber"
                value={form.documentNumber}
                onChange={updateField}
                placeholder="Número de Documento"
                maxLength={form.documentType === "DNI" ? 8 : 20}
                inputMode={form.documentType === "DNI" ? "numeric" : "text"}
                autoComplete="off"
                required
              />
            </label>

            {/* CARÁCTER VERIFICADOR: SOLO PARA DNI */}
            {form.documentType === "DNI" && (
              <label className="register-field" data-tour="verificationCode">
                <ShieldCheck className="field-icon" size={22} />

                <input
                  name="verificationCode"
                  value={form.verificationCode}
                  onChange={updateField}
                  placeholder="Carácter Verificador"
                  maxLength={1}
                  autoComplete="off"
                  required
                />

                <button
                  type="button"
                  className="verification-info-button"
                  onClick={() => setShowVerificationInfo(true)}
                  aria-label="Ver información sobre el carácter verificador"
                >
                  <Info size={18} />
                </button>
              </label>
            )}

            {/* FECHA DE NACIMIENTO */}
            <div
              className="register-field register-date-field"
              data-tour="birthDate"
            >
              <CalendarDays className="field-icon" size={22} />

              <DatePicker
                selected={birthDate}
                onChange={handleBirthDate}
                dateFormat="dd/MM/yyyy"
                locale={es}
                placeholderText="Fecha de nacimiento"
                showMonthDropdown
                showYearDropdown
                dropdownMode="scroll"
                maxDate={new Date()}
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                showPopperArrow={false}
                withPortal
                autoComplete="off"
              />
            </div>

            {/* CORREO ELECTRÓNICO */}
            <label className="register-field" data-tour="email">
              <Mail className="field-icon" size={22} />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="Correo electrónico"
                autoComplete="email"
                required
              />
            </label>

            {/* CELULAR */}
            <label className="register-field" data-tour="phone">
              <Phone className="field-icon" size={22} />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={updateField}
                placeholder="Celular"
                inputMode="numeric"
                maxLength={9}
                autoComplete="tel"
                required
              />
            </label>

            {/* MENSAJE DE ERROR */}
            {error && (
              <p className="register-error" role="alert">
                {error}
              </p>
            )}

            {/* BOTÓN CONTINUAR */}
            <button
              data-tour="continue"
              type="submit"
              className="register-primary-button"
              style={{ marginTop: "18px" }}
            >
              Continuar
              <ChevronRight size={21} strokeWidth={2} />
            </button>
          </form>
        )}

        {/* PASO 2: SEGURIDAD DE LA CUENTA */}
        {step === 2 && (
          <form className="register-form" onSubmit={submitRegistration}>
            <div className="register-section-title">
              <h2>Protege tu cuenta</h2>
              <p>Crea una contraseña segura para continuar.</p>
            </div>

            {/* CONTRASEÑA */}
            <label className="register-field" data-tour="password">
              <LockKeyhole className="field-icon" size={22} />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Contraseña"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </label>

            {/* CONFIRMAR CONTRASEÑA */}
            <label className="register-field" data-tour="confirmPassword">
              <LockKeyhole className="field-icon" size={22} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={updateField}
                placeholder="Confirmar contraseña"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </label>

            {/* TÉRMINOS Y CONDICIONES */}
            <label className="register-checkbox" data-tour="acceptTerms">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={updateField}
              />

              <span>
                Acepto los <a href="/terminos">Términos y Condiciones de Uso</a>
              </span>
            </label>

            {/* TRATAMIENTO DE DATOS */}
            <label className="register-checkbox" data-tour="acceptPrivacy">
              <input
                type="checkbox"
                name="acceptPrivacy"
                checked={form.acceptPrivacy}
                onChange={updateField}
              />

              <span>Autorización para el Tratamiento de Datos Personales</span>
            </label>

            {/* MENSAJE DE ERROR */}
            {error && (
              <p className="register-error" role="alert">
                {error}
              </p>
            )}

            {/* BOTÓN REGISTRARME */}
            <button data-tour="register" type="submit" className="register-primary-button">
              Registrarme
              <ChevronRight size={21} strokeWidth={2} />
            </button>

            <div className="register-divider">
              <span>¿Ya tienes una cuenta?</span>
            </div>

            <button
              type="button"
              className="register-secondary-button"
              onClick={() => navigate("/essalud")}
            >
              Inicia tu Sesión
            </button>

            {/* INFORMACIÓN DE CONTACTO */}
            <div className="register-contact">
              <Phone className="contact-icon" size={23} />

              <p>
                Consultas al <strong>3500800</strong> Opción 2
                <br />
                para Lima y Callao.
              </p>
            </div>

            <div className="register-contact">
              <Globe className="contact-icon" size={23} />

              <p>Provincias a EsSalud en Línea de la Red de su región.</p>
            </div>

            <p className="register-version">v1.9.3</p>
          </form>
        )}
      </section>

      {/* Modal Carácter Verificador */}
      {showVerificationInfo && (
        <VerificationCharacterModal
          onClose={() => setShowVerificationInfo(false)}
        />
      )}

      {showRegisterTutorial && (
        <RegisterHelpTutorial
          onClose={() => setShowRegisterTutorial(false)}
          documentType={form.documentType}
          step={step}
        />
      )}
    </main>
  );
}
