import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { ApiError, apiRequest } from "../lib/api";
import { getSourceLabel, getStatusLabel } from "../lib/labels";
import type { Client } from "../types/client";
import type {
  DeleteLeadResponse,
  Lead,
  LeadStatus,
  UpdateLeadClientResponse,
  UpdateLeadStatusResponse,
} from "../types/lead";
import type {
  CreateNoteResponse,
  DeleteNoteResponse,
  Note,
} from "../types/note";

// Estados disponibles para actualizar un lead.
const statusOptions: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "closed",
  "lost",
];

// Convierte fecha ISO a texto legible.
function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Página de detalle de lead.
// Permite ver datos, cambiar estado, asociar cliente, crear notas y borrar lead.
export function LeadDetailPage() {
  const params = useParams();
  const navigate = useNavigate();

  const leadId = params.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("new");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Carga el detalle del lead.
  async function loadLeadDetail() {
    if (!leadId) {
      return;
    }

    const response = await apiRequest<Lead>(`/leads/${leadId}`, {
      auth: true,
    });

    setLead(response);
    setSelectedStatus(response.status);
    setSelectedClientId(response.clientId ? String(response.clientId) : "");
    setNotes(response.notes ?? []);
  }

  // Carga clientes para el select de asociación.
  async function loadClients() {
    const response = await apiRequest<Client[]>("/clients", {
      auth: true,
    });

    setClients(response);
  }

  // Carga datos iniciales.
  useEffect(() => {
    async function loadPageData() {
      try {
        setError("");
        setIsLoading(true);

        await Promise.all([loadLeadDetail(), loadClients()]);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("No se pudo cargar el detalle del lead.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  // Actualiza el estado del lead.
  async function handleUpdateStatus(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!leadId) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setIsSavingStatus(true);

      const response = await apiRequest<UpdateLeadStatusResponse>(
        `/leads/${leadId}/status`,
        {
          method: "PATCH",
          auth: true,
          body: {
            status: selectedStatus,
          },
        }
      );

      setLead((currentLead) =>
        currentLead
          ? {
              ...currentLead,
              status: response.lead.status,
              updatedAt: response.lead.updatedAt,
            }
          : response.lead
      );

      setSuccessMessage("Estado actualizado correctamente.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo actualizar el estado.");
      }
    } finally {
      setIsSavingStatus(false);
    }
  }

  // Asocia o desasocia el lead con un cliente.
  async function handleUpdateClient(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!leadId) {
      return;
    }

    const clientIdValue = selectedClientId ? Number(selectedClientId) : null;

    try {
      setError("");
      setSuccessMessage("");
      setIsSavingClient(true);

      const response = await apiRequest<UpdateLeadClientResponse>(
        `/leads/${leadId}/client`,
        {
          method: "PATCH",
          auth: true,
          body: {
            clientId: clientIdValue,
          },
        }
      );

      setLead((currentLead) =>
        currentLead
          ? {
              ...currentLead,
              clientId: response.lead.clientId,
              client: response.lead.client,
              updatedAt: response.lead.updatedAt,
            }
          : response.lead
      );

      setSuccessMessage(
        clientIdValue === null
          ? "Cliente desasociado correctamente."
          : "Cliente asociado correctamente."
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo actualizar el cliente asociado.");
      }
    } finally {
      setIsSavingClient(false);
    }
  }

  // Crea una nota interna para este lead.
  async function handleCreateNote(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!leadId || !noteContent.trim()) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setIsCreatingNote(true);

      const response = await apiRequest<CreateNoteResponse>(
        `/leads/${leadId}/notes`,
        {
          method: "POST",
          auth: true,
          body: {
            content: noteContent.trim(),
          },
        }
      );

      setNotes((currentNotes) => [response.note, ...currentNotes]);
      setNoteContent("");
      setSuccessMessage("Nota creada correctamente.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo crear la nota.");
      }
    } finally {
      setIsCreatingNote(false);
    }
  }

  // Borra una nota interna.
  async function handleDeleteNote(noteId: number) {
    const confirmed = window.confirm("¿Seguro que querés borrar esta nota?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await apiRequest<DeleteNoteResponse>(`/notes/${noteId}`, {
        method: "DELETE",
        auth: true,
      });

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId)
      );

      setSuccessMessage("Nota eliminada correctamente.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo borrar la nota.");
      }
    }
  }

  // Borra el lead completo.
  async function handleDeleteLead() {
    if (!leadId) {
      return;
    }

    const confirmed = window.confirm(
      "¿Seguro que querés borrar este lead? Esta acción también borra sus notas."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setIsDeletingLead(true);

      await apiRequest<DeleteLeadResponse>(`/leads/${leadId}`, {
        method: "DELETE",
        auth: true,
      });

      navigate("/leads");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo borrar el lead.");
      }
    } finally {
      setIsDeletingLead(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page">
        <article className="card">
          <p>Cargando detalle del lead...</p>
        </article>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="page">
        <article className="card">
          <h3>No se pudo cargar el lead</h3>
          <p>{error}</p>
          <Link className="secondary-link" to="/leads">
            Volver a leads
          </Link>
        </article>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="page">
        <article className="card">
          <p>Lead no encontrado.</p>
          <Link className="secondary-link" to="/leads">
            Volver a leads
          </Link>
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Detalle del lead</p>
          <h2>{lead.name}</h2>
        </div>

        <div className="actions-row">
          <Link className="secondary-link" to="/leads">
            Volver
          </Link>

          <button
            className="danger-button"
            disabled={isDeletingLead}
            onClick={handleDeleteLead}
          >
            {isDeletingLead ? "Borrando..." : "Borrar lead"}
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
              <h3>Datos del lead</h3>
            </div>

            <span className={`status-badge status-${lead.status}`}>
              {getStatusLabel(lead.status)}
            </span>
          </div>

          <div className="detail-list">
            <div>
              <span>Email</span>
              <strong>{lead.email}</strong>
            </div>

            <div>
              <span>Teléfono</span>
              <strong>{lead.phone || "Sin teléfono"}</strong>
            </div>

            <div>
              <span>Origen</span>
              <strong>{getSourceLabel(lead.source)}</strong>
            </div>

            <div>
              <span>Cliente</span>
              <strong>{lead.client?.name ?? "Sin cliente asociado"}</strong>
            </div>

            <div>
              <span>Creado</span>
              <strong>{formatDateTime(lead.createdAt)}</strong>
            </div>

            <div>
              <span>Actualizado</span>
              <strong>{formatDateTime(lead.updatedAt)}</strong>
            </div>
          </div>

          <div className="message-box">
            <span>Mensaje</span>
            <p>{lead.message}</p>
          </div>
        </article>

        <aside className="side-panel">
          <article className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Estado</p>
                <h3>Cambiar estado</h3>
              </div>
            </div>

            <form className="stack-form" onSubmit={handleUpdateStatus}>
              <label>
                Estado
                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as LeadStatus)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <button className="primary-button" disabled={isSavingStatus}>
                {isSavingStatus ? "Guardando..." : "Guardar estado"}
              </button>
            </form>
          </article>

          <article className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Cliente</p>
                <h3>Asociar cliente</h3>
              </div>
            </div>

            <form className="stack-form" onSubmit={handleUpdateClient}>
              <label>
                Cliente
                <select
                  value={selectedClientId}
                  onChange={(event) => setSelectedClientId(event.target.value)}
                >
                  <option value="">Sin cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <button className="primary-button" disabled={isSavingClient}>
                {isSavingClient ? "Guardando..." : "Guardar cliente"}
              </button>
            </form>
          </article>
        </aside>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Notas</p>
            <h3>Notas internas</h3>
          </div>
        </div>

        <form className="note-form" onSubmit={handleCreateNote}>
          <textarea
            placeholder="Escribí una nota interna sobre este lead..."
            value={noteContent}
            onChange={(event) => setNoteContent(event.target.value)}
          />

          <button
            className="primary-button"
            disabled={isCreatingNote || !noteContent.trim()}
          >
            {isCreatingNote ? "Creando..." : "Crear nota"}
          </button>
        </form>

        <div className="notes-list">
          {notes.length === 0 ? (
            <p className="muted-text">Este lead todavía no tiene notas.</p>
          ) : (
            notes.map((note) => (
              <article className="note-card" key={note.id}>
                <div>
                  <p>{note.content}</p>
                  <small>
                    {note.user?.name ?? "Usuario desconocido"} ·{" "}
                    {formatDateTime(note.createdAt)}
                  </small>
                </div>

                <button
                  className="text-danger-button"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Borrar
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}