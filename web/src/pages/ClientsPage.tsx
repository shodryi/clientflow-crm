import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link } from "react-router";

import { ApiError, apiRequest } from "../lib/api";
import type { Client, CreateClientResponse } from "../types/client";

// Convierte una fecha ISO en texto simple.
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Página de clientes.
// Permite listar clientes y crear un cliente nuevo.
export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Carga clientes desde GET /clients.
  async function loadClients() {
    const response = await apiRequest<Client[]>("/clients", {
      auth: true,
    });

    setClients(response);
  }

  // Cargamos clientes al entrar en la página.
  useEffect(() => {
    async function loadPageData() {
      try {
        setLoadError("");
        setIsLoading(true);

        await loadClients();
      } catch (err) {
        setClients([]);

        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError("No se pudieron cargar los clientes.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, []);

  // Limpia el formulario de creación.
  function clearForm(): void {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
  }

  // Crea un cliente usando POST /clients.
  async function handleCreateClient(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setFormError("");
      setSuccessMessage("");
      setIsCreating(true);

      // Armamos el body solo con campos que realmente tienen valor.
      // Esto evita enviar strings vacíos al backend.
      const body: {
        name: string;
        email?: string;
        phone?: string;
        company?: string;
      } = {
        name: name.trim(),
      };

      if (email.trim()) {
        body.email = email.trim();
      }

      if (phone.trim()) {
        body.phone = phone.trim();
      }

      if (company.trim()) {
        body.company = company.trim();
      }

      const response = await apiRequest<CreateClientResponse>("/clients", {
        method: "POST",
        auth: true,
        body,
      });

      setClients((currentClients) => [response.client, ...currentClients]);
      clearForm();
      setSuccessMessage("Cliente creado correctamente.");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("No se pudo crear el cliente.");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Clientes</p>
          <h2>Gestión de clientes</h2>
        </div>
      </div>

      {loadError && (
        <article className="error-box">
          <h3>No se pudieron cargar los clientes</h3>
          <p>{loadError}</p>
        </article>
      )}

      {!loadError && (
        <>
          {formError && (
            <article className="error-box">
              <h3>No se pudo crear el cliente</h3>
              <p>{formError}</p>
            </article>
          )}

          {successMessage && (
            <div className="success-box">{successMessage}</div>
          )}

          <section className="detail-grid">
            <article className="card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Lista</p>
                  <h3>Clientes registrados</h3>
                </div>

                <span className="muted-text">{clients.length} clientes</span>
              </div>

              {isLoading ? (
                <p>Cargando clientes...</p>
              ) : clients.length === 0 ? (
                <p>No hay clientes cargados todavía.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Empresa</th>
                        <th>Teléfono</th>
                        <th>Leads asociados</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id}>
                          <td>{client.id}</td>

                          <td>
                            <strong>{client.name}</strong>
                            <small>{client.email || "Sin email"}</small>
                          </td>

                          <td>{client.company || "—"}</td>

                          <td>{client.phone || "—"}</td>

                          <td>{client._count?.leads ?? 0}</td>

                          <td>{formatDate(client.createdAt)}</td>

                          <td>
                            <Link
                              className="table-link"
                              to={`/clients/${client.id}`}
                            >
                              Ver detalle
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <aside className="side-panel">
              <article className="card">
                <div className="card-header">
                  <div>
                    <p className="eyebrow">Crear</p>
                    <h3>Nuevo cliente</h3>
                  </div>
                </div>

                <form className="stack-form" onSubmit={handleCreateClient}>
                  <label>
                    Nombre *
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ej: Estudio Creativo Sur"
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="contacto@email.com"
                    />
                  </label>

                  <label>
                    Teléfono
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+54 11 5555-1234"
                    />
                  </label>

                  <label>
                    Empresa
                    <input
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="Ej: Estudio Creativo"
                    />
                  </label>

                  <button
                    className="primary-button"
                    disabled={isCreating || !name.trim()}
                  >
                    {isCreating ? "Creando..." : "Crear cliente"}
                  </button>
                </form>
              </article>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}