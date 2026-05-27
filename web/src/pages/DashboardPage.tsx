import { useEffect, useMemo, useState } from "react";

import { ApiError, apiRequest } from "../lib/api";
import { getSourceLabel, getStatusLabel } from "../lib/labels";
import type { DashboardStats } from "../types/dashboard";

// Convierte un número decimal en texto de porcentaje.
// Ejemplo: 8.33 -> "8.33%"
function formatPercent(value: number): string {
  return `${value}%`;
}

// Calcula el ancho de una barra visual.
// Si max es 0, devolvemos 0 para evitar división inválida.
function getBarWidth(count: number, max: number): string {
  if (max === 0) {
    return "0%";
  }

  return `${Math.round((count / max) * 100)}%`;
}

// Página de dashboard.
// Consume GET /dashboard/stats del backend.
export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Cargamos las estadísticas reales al entrar al dashboard.
  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setError("");

        const response = await apiRequest<DashboardStats>("/dashboard/stats", {
          auth: true,
        });

        setStats(response);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("No se pudo cargar el panel.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  // Calculamos el mayor count de status para dibujar barras proporcionales.
  const maxStatusCount = useMemo(() => {
    if (!stats) {
      return 0;
    }

    return Math.max(...stats.leadsByStatus.map((item) => item.count), 0);
  }, [stats]);

  // Calculamos el mayor count de source para dibujar barras proporcionales.
  const maxSourceCount = useMemo(() => {
    if (!stats) {
      return 0;
    }

    return Math.max(...stats.leadsBySource.map((item) => item.count), 0);
  }, [stats]);

  if (isLoading) {
    return (
      <div className="page">
        <article className="card">
          <p>Cargando estadísticas del dashboard...</p>
        </article>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <article className="error-box">
          <h3>No se pudo cargar el dashboard</h3>
          <p>{error}</p>
        </article>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page">
        <article className="card">
          <p>No hay estadísticas disponibles.</p>
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Panel</p>
          <h2>Resumen general</h2>
        </div>
      </div>

      <section className="stat-grid">
        <article className="stat-card">
          <span>Leads totales</span>
          <strong>{stats.totals.leads}</strong>
          <small>Contactos recibidos desde formularios.</small>
        </article>

        <article className="stat-card">
          <span>Clientes totales</span>
          <strong>{stats.totals.clients}</strong>
          <small>Clientes cargados en el CRM.</small>
        </article>

        <article className="stat-card">
          <span>Notas totales</span>
          <strong>{stats.totals.notes}</strong>
          <small>Notas internas creadas por usuarios.</small>
        </article>

        <article className="stat-card">
          <span>Tasa de conversión</span>
          <strong>{formatPercent(stats.performance.conversionRate)}</strong>
          <small>Leads cerrados sobre el total.</small>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Actividad</p>
              <h3>Actividad</h3>
            </div>
          </div>

          <div className="metric-list">
            <div className="metric-row">
              <span>Leads creados hoy</span>
              <strong>{stats.activity.leadsCreatedToday}</strong>
            </div>

            <div className="metric-row">
              <span>Leads creados este mes</span>
              <strong>{stats.activity.leadsCreatedThisMonth}</strong>
            </div>

            <div className="metric-row">
              <span>Leads cerrados</span>
              <strong>{stats.performance.closedLeads}</strong>
            </div>

            <div className="metric-row">
              <span>Leads perdidos</span>
              <strong>{stats.performance.lostLeads}</strong>
            </div>

            <div className="metric-row">
              <span>Tasa de pérdida</span>
              <strong>{formatPercent(stats.performance.lostRate)}</strong>
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Estados</p>
              <h3>Leads por estado</h3>
            </div>
          </div>

          <div className="bar-list">
            {stats.leadsByStatus.map((item) => (
              <div className="bar-row" key={item.status}>
                <div className="bar-label">
                  <span>{getStatusLabel(item.status)}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: getBarWidth(item.count, maxStatusCount),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Origen</p>
              <h3>Leads por origen</h3>
            </div>
          </div>

          <div className="bar-list">
            {stats.leadsBySource.map((item) => (
              <div className="bar-row" key={item.source}>
                <div className="bar-label">
                  <span>{getSourceLabel(item.source)}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: getBarWidth(item.count, maxSourceCount),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Recientes</p>
              <h3>Leads recientes</h3>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Origen</th>
                </tr>
              </thead>

              <tbody>
                {stats.recentLeads.map((lead) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}