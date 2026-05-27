import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { ApiError, apiRequest } from "../lib/api";
import { getSourceLabel, getStatusLabel } from "../lib/labels";
import type {
  ClientDetail,
  DeleteClientResponse,
  UpdateClientResponse,
} from "../types/client";

// Convierte una fecha ISO en texto legible.
function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Página de detalle de cliente.
// Permite ver sus datos, editarlo, ver leads asociados y borrarlo.
export function ClientDetailPage() {
  const params = useParams();
  const navigate = useNavigate();

  const clientId = params.id;

  const [client, setClient] = useState<ClientDetail | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carga el detalle usando GET /clients/:id.
  async function loadClientDetail() {
    if (!clientId) {
      return;
    }

    const response = await apiRequest<ClientDetail>(`/clients/${clientId}`, {
      auth: true,
    });

    setClient(response);
    setName(response.name);
    setEmail(response.email ?? "");
    setPhone(response.phone ?? "");
    setCompany(response.company ?? "");
  }

  // Carga datos iniciales.
  useEffect(() => {
    async function loadPageData() {
      try {
        setError("");
        setIsLoading(true);

        await loadClientDetail();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("No se pudo cargar el cliente.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Actualiza cliente usando PUT /clients/:id.
  async function handleUpdateClient(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setIsUpdating(true);

      const body: {
        name?: string;
        email?: string;
        phone?: string;
        company?: string;
      } = {};

      if (name.trim()) {
        body.name = name.trim();
      }

      if (email.trim()) {
        body.email = email.trim();
      }

      if (phone.trim()) {
        body.phone = phone.trim();
      }

      if (company.trim()) {
        body.company = company.trim();
      }

      const response = await apiRequest<UpdateClientResponse>(
        `/clients/${clientId}`,
        {
          method: "PUT",
          auth: true,
          body,
        }
      );

      setClient((currentClient) =>
        currentClient
          ? {
              ...currentClient,
              ...response.client,
            }
          : {
              ...response.client,
              leads: [],
            }
      );

      setSuccessMessage("Cliente actualizado correctamente.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo actualizar el cliente.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  // Borra cliente usando DELETE /clients/:id.
  async function handleDeleteClient() {
    if (!clientId) {
      return;
    }

    const confirmed = window.confirm(
      "¿Seguro que querés borrar este cliente? Sus leads quedarán sin cliente asociado."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setIsDeleting(true);

      await apiRequest<DeleteClientResponse>(`/clients/${clientId}`, {
        method: "DELETE",
        auth: true,
      });

      navigate("/clients");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo borrar el cliente.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page">
        <article className="card">
          <p>Cargando detalle del cliente...</p>
        </article>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="page">
        <article className="card">
          <h3>No se pudo cargar el cliente</h3>
          <p>{error}</p>
          <Link className="secondary-link" to="/clients">
            Volver a clientes
          </Link>
        </article>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="page">
        <article className="card">
          <p>Cliente no encontrado.</p>
          <Link className="secondary-link" to="/clients">
            Volver a clientes
          </Link>
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Detalle del cliente</p>
          <h2>{client.name}</h2>
        </div>

        <div className="actions-row">
          <Link className="secondary-link" to="/clients">
            Volver
          </Link>

          <button
            className="danger-button"
            disabled={isDeleting}
            onClick={handleDeleteClient}
          >
            {isDeleting ? "Borrando..." : "Borrar cliente"}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {successMessage && <div className="success-box">{successMessage}</div>}

      <section className="detail-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Información</p>
              <h3>Datos del cliente</h3>
            </div>
          </div>

          <div className="detail-list">
            <div>
              <span>Email</span>
              <strong>{client.email || "Sin email"}</strong>
            </div>

            <div>
              <span>Teléfono</span>
              <strong>{client.phone || "Sin teléfono"}</strong>
            </div>

            <div>
              <span>Empresa</span>
              <strong>{client.company || "Sin empresa"}</strong>
            </div>

            <div>
              <span>Creado</span>
              <strong>{formatDateTime(client.createdAt)}</strong>
            </div>

            <div>
              <span>Actualizado</span>
              <strong>{formatDateTime(client.updatedAt)}</strong>
            </div>
          </div>
        </article>

        <aside className="side-panel">
          <article className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Editar</p>
                <h3>Editar cliente</h3>
              </div>
            </div>

            <form className="stack-form" onSubmit={handleUpdateClient}>
              <label>
                Nombre
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label>
                Teléfono
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>

              <label>
                Empresa
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </label>

              <button
                className="primary-button"
                disabled={isUpdating || !name.trim()}
              >
                {isUpdating ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </article>
        </aside>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Leads asociados</p>
            <h3>Leads asociados</h3>
          </div>

          <span className="muted-text">{client.leads.length} leads</span>
        </div>

        {client.leads.length === 0 ? (
          <p>Este cliente todavía no tiene leads asociados.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lead</th>
                  <th>Estado</th>
                  <th>Origen</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {client.leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.id}</td>

                    <td>
                      <strong>{lead.name}</strong>
                      <small>{lead.email}</small>
                    </td>

                    <td>
                      <span className={`status-badge status-${lead.status}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>

                    <td>{getSourceLabel(lead.source)}</td>

                    <td>{formatDateTime(lead.createdAt)}</td>

                    <td>
                      <Link className="table-link" to={`/leads/${lead.id}`}>
                        Ver lead
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}