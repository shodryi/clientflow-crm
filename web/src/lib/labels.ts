import type { LeadSortBy, LeadStatus, SortOrder } from "../types/lead";

// Traduce los estados internos del backend a textos visibles en español.
export function getStatusLabel(status: LeadStatus | string): string {
  const labels: Record<string, string> = {
    new: "Nuevo",
    contacted: "Contactado",
    quoted: "Presupuestado",
    closed: "Cerrado",
    lost: "Perdido",
  };

  return labels[status] ?? status;
}

// Traduce los orígenes internos a textos visibles en español.
export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    website: "Sitio web",
    "landing-page": "Landing page",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    ads: "Anuncios",
    referral: "Referido",
  };

  return labels[source] ?? source;
}

// Traduce campos de ordenamiento.
export function getSortByLabel(sortBy: LeadSortBy): string {
  const labels: Record<LeadSortBy, string> = {
    createdAt: "Fecha de creación",
    updatedAt: "Última actualización",
    name: "Nombre",
    email: "Email",
    status: "Estado",
  };

  return labels[sortBy];
}

// Traduce orden asc/desc.
export function getSortOrderLabel(sortOrder: SortOrder): string {
  const labels: Record<SortOrder, string> = {
    asc: "Ascendente",
    desc: "Descendente",
  };

  return labels[sortOrder];
}