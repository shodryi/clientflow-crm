import { Navigate, Route, Routes } from "react-router";

import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ClientDetailPage } from "./pages/ClientDetailPage";
import { ClientsPage } from "./pages/ClientsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LeadDetailPage } from "./pages/LeadDetailPage";
import { LeadsPage } from "./pages/LeadsPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PublicLeadPage } from "./pages/PublicLeadPage";

// Define las rutas principales del frontend.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Ruta pública: cualquiera puede crear un lead desde este formulario. */}
      <Route path="/public-lead" element={<PublicLeadPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />

          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
        </Route>
      </Route>

      {/* Ruta inicial: si hay sesión, ProtectedRoute permite entrar; si no, manda a login. */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Cualquier ruta inexistente muestra una página 404 real. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// App principal.
// Envolvemos las rutas con AuthProvider para tener auth global.
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}