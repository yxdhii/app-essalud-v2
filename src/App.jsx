import { BrowserRouter, Routes, Route } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
import HomeScreen from "./pages/HomeScreen";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import HeatMap from "./pages/HeatMap";
import ReportDetail from "./pages/ReportDetail";
import PublicProfile from "./pages/PublicProfile";
import RouteSelection from "./pages/RouteSelection";
import ReportIncident from "./pages/ReportIncident";
import ReportSuccess from "./pages/ReportSuccess";
import Navigation from "./pages/Navigation";
import TripComplete from "./pages/TripComplete";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import MyReports from "./pages/MyReports";
import Badges from "./pages/Badges";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import DataProtectionLaw from "./pages/DataProtectionLaw";
import EsSalud from "./pages/EsSaludSplash";
import EsSaludWelcome from "./pages/EsSaludWelcome";
import EsSaludLogin from "./pages/EsSaludLogin";
import EsSaludRegister from "./pages/EsSaludRegister";
import EsSaludHome from "./pages/EsSaludHome";
import MisCitas from "./pages/MisCitas";
import ReservarCita from "./pages/ReservarCita";
import DetalleCita from "./pages/DetalleCita";
import CitaVirtual from "./pages/CitaVirtual";
import SeleccionarPerfil from "./pages/SeleccionarPerfil";
import DetalleFamiliar from "./pages/DetalleFamiliar";
import AgregarFamiliar from "./pages/AgregarFamiliar";
import CambiarCuenta from "./pages/CambiarCuenta";
import Recetas from "./pages/Recetas";
import Examenes from "./pages/Examenes";
import CentrosAtencion from "./pages/CentrosAtencion";
import Chat from "./pages/Chat";
import Perfil from "./pages/Perfil";
import DatosPersonales from "./pages/DatosPersonales";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/essalud" element={<EsSalud />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/heatmap" element={<HeatMap />} />
          <Route path="/report-detail" element={<ReportDetail />} />
          <Route path="/public-profile" element={<PublicProfile />} />
          <Route path="/route-selection" element={<RouteSelection />} />
          <Route path="/report" element={<ReportIncident />} />
          <Route path="/report-success" element={<ReportSuccess />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/trip-complete" element={<TripComplete />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/help" element={<Help />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/data-protection-law" element={<DataProtectionLaw />} />
          <Route path="/essalud/bienvenida" element={<EsSaludWelcome />} />
          <Route path="/essalud/login" element={<EsSaludLogin />} />
          <Route path="/essalud/registro" element={<EsSaludRegister />} />
          <Route path="/essalud/inicio" element={<EsSaludHome />} />
          <Route path="/essalud/citas" element={<MisCitas />} />
          <Route path="/essalud/reservar-cita" element={<ReservarCita />} />
          <Route path="/essalud/detalle-cita" element={<DetalleCita />} />
          <Route path="/essalud/cita-virtual" element={<CitaVirtual />} />
          <Route path="/essalud/familiares" element={<SeleccionarPerfil />} />
          <Route path="/essalud/familiar/:dni" element={<DetalleFamiliar />} />
          <Route
            path="/essalud/agregar-familiar"
            element={<AgregarFamiliar />}
          />
          <Route path="/essalud/cambiar-cuenta" element={<CambiarCuenta />} />
          <Route
            path="/essalud/seleccionar-perfil"
            element={<SeleccionarPerfil />}
          />
          <Route path="/essalud/recetas" element={<Recetas />} />
          <Route path="/essalud/examenes" element={<Examenes />} />
          <Route
            path="/essalud/centros-atencion"
            element={<CentrosAtencion />}
          />
          <Route path="/essalud/chat" element={<Chat />} />
          <Route path="/essalud/perfil" element={<Perfil />} />
          <Route
            path="/essalud/datos-personales"
            element={<DatosPersonales />}
          />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  );
}

export default App;
