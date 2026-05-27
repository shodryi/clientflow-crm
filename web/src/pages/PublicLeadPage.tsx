import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link } from "react-router";

import { useAuth } from "../context/AuthContext";
import { ApiError, apiRequest } from "../lib/api";
import type { Lead } from "../types/lead";

// Body que vamos a enviar a POST /leads/public.
// phone y source son opcionales porque el backend también los acepta como opcionales.
type CreatePublicLeadBody = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
};

// Respuesta esperada de POST /leads/public.
type CreatePublicLeadResponse = {
  message: string;
  lead: Lead;
};

// Página pública para crear leads.
// Simula el formulario de contacto de una landing page.
export function PublicLeadPage() {
  const { isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("website");
  const [message, setMessage] = useState("");

  const [createdLead, setCreatedLead] = useState<Lead | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpia el formulario después de crear un lead.
  function clearForm(): void {
    setName("");
    setEmail("");
    setPhone("");
    setSource("website");
    setMessage("");
  }

  // Crea un lead público usando POST /leads/public.
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setCreatedLead(null);
      setIsSubmitting(true);

      // Armamos el body base con los campos obligatorios.
      const body: CreatePublicLeadBody = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      };

      // Agregamos phone solo si tiene contenido.
      if (phone.trim()) {
        body.phone = phone.trim();
      }

      // Agregamos source solo si tiene contenido.
      if (source.trim()) {
        body.source = source.trim();
      }

      const response = await apiRequest<CreatePublicLeadResponse>(
        "/leads/public",
        {
          method: "POST",
          body,
        }
      );

      setCreatedLead(response.lead);
      clearForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo enviar la consulta. Intentá nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="public-lead-page">
      <section className="public-lead-card">
        <div className="public-lead-intro">
          <div className="login-logo">C</div>

          <div>
            <p className="eyebrow">Formulario público</p>
            <h1>Solicitá una consulta</h1>
            <p>
              Este formulario simula una landing page pública conectada con
              ClientFlow API.
            </p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {createdLead && (
          <div className="success-box">
            <strong>Consulta enviada correctamente.</strong>
            <p>
              Gracias, {createdLead.name}. Recibimos tu mensaje y será revisado desde
              el panel interno de ClientFlow.
            </p>

            {isAuthenticated && (
              <Link className="secondary-link" to={`/leads/${createdLead.id}`}>
                Ver detalle del lead
              </Link>
            )}
          </div>
        )}

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Nombre *
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Ana López"
            />
          </label>

          <label>
            Email *
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ana@email.com"
            />
          </label>

          <label>
            Teléfono
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+54 11 1234-5678"
            />
          </label>

          <label>
            Origen
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              <option value="website">Sitio web</option>
              <option value="landing-page">Landing page</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="ads">Anuncios</option>
              <option value="referral">Referido</option>
            </select>
          </label>

          <label>
            Mensaje *
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Contame qué necesitás..."
            />
          </label>

          <button
            className="primary-button"
            disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
          >
            {isSubmitting ? "Enviando..." : "Enviar consulta"}
          </button>
        </form>

        <div className="public-lead-footer">
          {isAuthenticated ? (
            <Link className="secondary-link" to="/dashboard">
              Volver al dashboard
            </Link>
          ) : (
            <Link className="secondary-link" to="/login">
              Ir al inicio de sesión
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}