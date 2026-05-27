import { Link } from "react-router";

import { useAuth } from "../context/AuthContext";

// Página para rutas inexistentes.
// Evita redirigir silenciosamente al dashboard cuando la URL está mal.
export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="not-found-page">
      <section className="not-found-card">
        <div className="login-logo">C</div>

        <p className="eyebrow">404</p>
        <h1>Página no encontrada</h1>

        <p>
          La ruta que intentaste abrir no existe dentro de ClientFlow Web.
        </p>

        <div className="not-found-actions">
          {isAuthenticated ? (
            <>
              <Link className="primary-link-button" to="/dashboard">
                Ir al dashboard
              </Link>

              <Link className="secondary-link" to="/leads">
                Ver leads
              </Link>
            </>
          ) : (
            <>
              <Link className="primary-link-button" to="/login">
                Ir al login
              </Link>

              <Link className="secondary-link" to="/public-lead">
                Probar formulario público
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}