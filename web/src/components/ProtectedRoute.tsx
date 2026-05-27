import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";

// Protege rutas privadas.
// Si no hay usuario logueado, redirige a /login.
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="center-screen">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}