import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

type ApiConnectionStatus = "checking" | "online" | "offline";

type HealthResponse = {
  status: string;
  message: string;
};

// Layout principal para pantallas privadas.
// Tiene sidebar, header y contenido.
// También verifica si el backend está conectado usando GET /health.
export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [apiStatus, setApiStatus] =
    useState<ApiConnectionStatus>("checking");

  // Verifica si la API está disponible.
  async function checkApiStatus(): Promise<void> {
    try {
      await apiRequest<HealthResponse>("/health");

      setApiStatus("online");
    } catch {
      setApiStatus("offline");
    }
  }

  // Chequea la API al cargar el layout, al cambiar de ruta,
  // al volver a enfocar la ventana y cada 10 segundos.
  useEffect(() => {
    void checkApiStatus();

    const intervalId = window.setInterval(() => {
      void checkApiStatus();
    }, 10000);

    window.addEventListener("focus", checkApiStatus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkApiStatus);
    };
  }, [location.pathname]);

  const apiStatusText =
    apiStatus === "online"
      ? "API conectada"
      : apiStatus === "offline"
        ? "API no conectada"
        : "Verificando API...";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">C</span>
          <span>
            <strong>ClientFlow</strong>
            <small>Mini CRM</small>
          </span>
        </Link>

        <nav className="nav">
          <NavLink to="/dashboard">Panel</NavLink>
          <NavLink to="/leads">Leads</NavLink>
          <NavLink to="/clients">Clientes</NavLink>
          <NavLink to="/public-lead">Formulario público</NavLink>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className={`eyebrow api-status api-status-${apiStatus}`}>
              {apiStatusText}
            </p>
            <h1>ClientFlow Web</h1>
          </div>

          <div className="user-box">
            <span>{user?.name}</span>
            <button className="secondary-button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}