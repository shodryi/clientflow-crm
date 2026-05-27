import type { Client } from "./client";
import type { Note } from "./note";

// Estados posibles de un lead en la API.
export type LeadStatus = "new" | "contacted" | "quoted" | "closed" | "lost";

// Campos permitidos para ordenar leads.
export type LeadSortBy = "createdAt" | "updatedAt" | "name" | "email" | "status";

// Orden permitido.
export type SortOrder = "asc" | "desc";

// Lead recibido desde el backend.
export type Lead = {
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
  client?: Client | null;
  notes?: Note[];
  _count?: {
    notes: number;
  };
};

// Metadata de paginación devuelta por GET /leads.
export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// Respuesta de GET /leads.
export type LeadsResponse = {
  data: Lead[];
  pagination: Pagination;
};

// Respuesta de PATCH /leads/:id/status.
export type UpdateLeadStatusResponse = {
  message: string;
  lead: Lead;
};

// Respuesta de PATCH /leads/:id/client.
export type UpdateLeadClientResponse = {
  message: string;
  lead: Lead;
};

// Respuesta de DELETE /leads/:id.
export type DeleteLeadResponse = {
  message: string;
  lead: Lead;
};