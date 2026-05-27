import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Página de login.
// Se conecta con POST /auth/login del backend.
export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("usuario@test.com");
  const [password, setPassword] = useState("contra123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesión. Revisá los datos e intentá nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">C</div>

        <h1>ClientFlow</h1>
        <p>Ingresá para administrar leads, clientes y notas internas.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <small className="helper-text">
          Demo local: usuario@test.com / contra123
        </small>

        <Link className="secondary-link login-public-link" to="/public-lead">
  Probar formulario público
</Link>
      </form>
    </div>
  );
}