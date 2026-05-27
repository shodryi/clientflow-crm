// Lista centralizada de estados permitidos en la API.
// Usamos "as const" para que TypeScript los trate como valores literales.
export const allowedStatuses = [
  "new",
  "contacted",
  "quoted",
  "closed",
  "lost",
] as const;

// Tipo público de status.
// Sale directamente desde allowedStatuses para no repetir los mismos valores en otro lado.
export type LeadStatus = (typeof allowedStatuses)[number];

// Estos son los estados como existen dentro de Prisma/base de datos.
type PrismaLeadStatus = "NEW" | "CONTACTED" | "QUOTED" | "CLOSED" | "LOST";

// Valida si un string es realmente un LeadStatus de nuestra API.
// Esto es un type guard de TypeScript.
export function isLeadStatus(status: string): status is LeadStatus {
  return (allowedStatuses as readonly string[]).includes(status);
}

// Convierte el status de la API al formato que usa Prisma.
// Ejemplo: "contacted" -> "CONTACTED"
export function toPrismaLeadStatus(status: LeadStatus): PrismaLeadStatus {
  const statusMap: Record<LeadStatus, PrismaLeadStatus> = {
    new: "NEW",
    contacted: "CONTACTED",
    quoted: "QUOTED",
    closed: "CLOSED",
    lost: "LOST",
  };

  return statusMap[status];
}

// Convierte el status de Prisma al formato público de la API.
// Ejemplo: "CONTACTED" -> "contacted"
export function fromPrismaLeadStatus(status: PrismaLeadStatus): LeadStatus {
  const statusMap: Record<PrismaLeadStatus, LeadStatus> = {
    NEW: "new",
    CONTACTED: "contacted",
    QUOTED: "quoted",
    CLOSED: "closed",
    LOST: "lost",
  };

  return statusMap[status];
}