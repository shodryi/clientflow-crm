import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { ApiError, apiRequest } from "../lib/api";
import {
  getSortByLabel,
  getSortOrderLabel,
  getSourceLabel,
  getStatusLabel,
} from "../lib/labels";
import type { Client } from "../types/client";
import type {
  Lead,
  LeadSortBy,
  LeadStatus,
  LeadsResponse,
  SortOrder,
} from "../types/lead";

// Opciones de estado disponibles para el filtro.
const statusOptions: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "closed",
  "lost",
];

// Opciones de ordenamiento permitidas.
const sortByOptions: LeadSortBy[] = [
  "createdAt",
  "updatedAt",
  "name",
  "email",
  "status",
];

// Convierte fecha ISO en texto simple.
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Crea la query string para GET /leads usando los filtros actuales.
function buildLeadsQuery(params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  clientId: string;
  sortBy: LeadSortBy;
  sortOrder: SortOrder;
}): string {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  query.set("sortBy", params.sortBy);
  query.set("sortOrder", params.sortOrder);

  if (params.search.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.clientId) {
    query.set("clientId", params.clientId);
  }

  return query.toString();
}

// Página de leads.
// Consume GET /leads con filtros, búsqueda, ordenamiento y paginación.
export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<LeadsResponse["pagination"]>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [clientId, setClientId] = useState("");
  const [sortBy, setSortBy] = useState<LeadSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);

  const [error, setError] = useState("");
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Cargamos clientes una vez para poder usarlos en el filtro por cliente.
  useEffect(() => {
    async function loadClients() {
      try {
        const response = await apiRequest<Client[]>("/clients", {
          auth: true,
        });

        setClients(response);
      } catch {
        // Si falla clients, la tabla de leads igual puede funcionar.
        setClients([]);
      } finally {
        setIsLoadingClients(false);
      }
    }

    loadClients();
  }, []);

  // Cargamos leads cada vez que cambian filtros, ordenamiento o paginación.
  useEffect(() => {
    async function loadLeads() {
      try {
        setError("");
        setIsLoadingLeads(true);

        const query = buildLeadsQuery({
          page,
          limit,
          search,
          status,
          clientId,
          sortBy,
          sortOrder,
        });

        const response = await apiRequest<LeadsResponse>(`/leads?${query}`, {
          auth: true,
        });

        setLeads(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setLeads([]);
        setPagination({
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });

        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("No se pudieron cargar los leads.");
        }
      } finally {
        setIsLoadingLeads(false);
      }
    }

    loadLeads();
  }, [page, limit, search, status, clientId, sortBy, sortOrder]);

  // Mapa para encontrar rápido el nombre del cliente según clientId.
  const clientsById = useMemo(() => {
    return new Map(clients.map((client) => [client.id, client]));
  }, [clients]);

  // Reinicia filtros y vuelve a página 1.
  function clearFilters(): void {
    setSearch("");
    setStatus("");
    setClientId("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(5);
    setPage(1);
  }

  // Cuando cambia un filtro, volvemos a página 1 para evitar quedar en una página inexistente.
  function handleFilterChange(callback: () => void): void {
    callback();
    setPage(1);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Leads</p>
          <h2>Gestión de leads</h2>
        </div>

        <button className="secondary-button" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      {error && (
        <article className="error-box">
          <h3>No se pudieron cargar los leads</h3>
          <p>{error}</p>
        </article>
      )}

      {!error && (
        <>
          <section className="card">
            <div className="filters-grid">
              <label>
                Buscar
                <input
                  type="search"
                  placeholder="Nombre, email, mensaje u origen"
                  value={search}
                  onChange={(event) =>
                    handleFilterChange(() => setSearch(event.target.value))
                  }
                />
              </label>

              <label>
                Estado
                <select
                  value={status}
                  onChange={(event) =>
                    handleFilterChange(() => setStatus(event.target.value))
                  }
                >
                  <option value="">Todos</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {getStatusLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cliente
                <select
                  value={clientId}
                  onChange={(event) =>
                    handleFilterChange(() => setClientId(event.target.value))
                  }
                  disabled={isLoadingClients}
                >
                  <option value="">Todos</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Ordenar por
                <select
                  value={sortBy}
                  onChange={(event) =>
                    handleFilterChange(() =>
                      setSortBy(event.target.value as LeadSortBy)
                    )
                  }
                >
                  {sortByOptions.map((option) => (
                    <option key={option} value={option}>
                      {getSortByLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Orden
                <select
                  value={sortOrder}
                  onChange={(event) =>
                    handleFilterChange(() =>
                      setSortOrder(event.target.value as SortOrder)
                    )
                  }
                >
                  <option value="desc">{getSortOrderLabel("desc")}</option>
                  <option value="asc">{getSortOrderLabel("asc")}</option>
                </select>
              </label>

              <label>
                Por página
                <select
                  value={limit}
                  onChange={(event) =>
                    handleFilterChange(() =>
                      setLimit(Number(event.target.value))
                    )
                  }
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </label>
            </div>
          </section>

          <section className="card">
            <div className="table-topbar">
              <div>
                <p className="eyebrow">Resultados</p>
                <h3>{pagination.total} leads encontrados</h3>
              </div>

              <span className="muted-text">
                Página {pagination.page} de {pagination.totalPages || 1}
              </span>
            </div>

            {isLoadingLeads ? (
              <p>Cargando leads...</p>
            ) : leads.length === 0 ? (
              <p>No hay leads para los filtros seleccionados.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Lead</th>
                      <th>Estado</th>
                      <th>Origen</th>
                      <th>Cliente</th>
                      <th>Notas</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map((lead) => {
                      const client = lead.clientId
                        ? clientsById.get(lead.clientId)
                        : null;

                      return (
                        <tr key={lead.id}>
                          <td>{lead.id}</td>

                          <td>
                            <strong>{lead.name}</strong>
                            <small>{lead.email}</small>
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${lead.status}`}
                            >
                              {getStatusLabel(lead.status)}
                            </span>
                          </td>

                          <td>{getSourceLabel(lead.source)}</td>

                          <td>{client?.name ?? "Sin cliente"}</td>

                          <td>{lead._count?.notes ?? 0}</td>

                          <td>{formatDate(lead.createdAt)}</td>

                          <td>
                            <Link
                              className="table-link"
                              to={`/leads/${lead.id}`}
                            >
                              Ver detalle
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pagination-bar">
              <button
                className="secondary-button"
                disabled={!pagination.hasPreviousPage || isLoadingLeads}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Anterior
              </button>

              <span>
                {pagination.total === 0
                  ? "Sin resultados"
                  : `Mostrando ${leads.length} de ${pagination.total}`}
              </span>

              <button
                className="secondary-button"
                disabled={!pagination.hasNextPage || isLoadingLeads}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Siguiente
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}