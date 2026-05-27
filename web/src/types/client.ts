import type { LeadStatus } from "./lead";

// Cliente básico usado en filtros, listados y relaciones.
export type Client = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    leads: number;
  };
};

// Lead simplificado que viene incluido dentro de GET /clients/:id.
export type ClientLead = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  clientId: number | null;
};

// Detalle de cliente.
// GET /clients/:id devuelve el cliente con sus leads asociados.
export type ClientDetail = Client & {
  leads: ClientLead[];
};

// Respuesta de POST /clients.
export type CreateClientResponse = {
  message: string;
  client: Client;
};

// Respuesta de PUT /clients/:id.
export type UpdateClientResponse = {
  message: string;
  client: Client;
};

// Respuesta de DELETE /clients/:id.
export type DeleteClientResponse = {
  message: string;
  client: Client;
};