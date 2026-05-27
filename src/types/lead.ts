// Reexportamos LeadStatus desde constants.
// Así otros archivos pueden seguir importándolo desde "../types/lead.js".
export type { LeadStatus } from "../constants/lead-statuses.js";

import type { LeadStatus } from "../constants/lead-statuses.js";

// Campos permitidos para ordenar leads.
export type LeadSortBy = "createdAt" | "updatedAt" | "name" | "email" | "status";

// Orden permitido para los resultados.
export type SortOrder = "asc" | "desc";

// Datos necesarios para crear un lead.
// El controller valida que name, email y message existan antes de llegar al service.
export type CreateLeadInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
};

// Filtros disponibles para listar leads.
// Esto representa lo que el service necesita para consultar la base.
export type GetLeadsInput = {
  status?: LeadStatus;
  search?: string;
  clientId?: number;
  page: number;
  limit: number;
  sortBy: LeadSortBy;
  sortOrder: SortOrder;
};