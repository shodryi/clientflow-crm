// Importamos Zod para crear schemas de validación.
import * as z from "zod";

// Importamos los estados permitidos.
// Los usamos para validar status en body y query params.
import { allowedStatuses } from "../constants/lead-statuses.js";

// Campos permitidos para ordenar resultados en GET /leads.
const leadSortFields = [
  "createdAt",
  "updatedAt",
  "name",
  "email",
  "status",
] as const;

// Órdenes permitidos para sortOrder.
const sortOrders = ["asc", "desc"] as const;

// Schema para validar el body de POST /leads/public.
// Valida que los campos requeridos existan y tengan formato correcto.
export const createLeadBodySchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters" }),

  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email format" })),

  phone: z
    .string()
    .trim()
    .min(1, { error: "Phone cannot be empty" })
    .max(30, { error: "Phone must be at most 30 characters" })
    .optional(),

  message: z
    .string({ error: "Message is required" })
    .trim()
    .min(1, { error: "Message is required" })
    .max(2000, { error: "Message must be at most 2000 characters" }),

  source: z
    .string()
    .trim()
    .min(1, { error: "Source cannot be empty" })
    .max(100, { error: "Source must be at most 100 characters" })
    .optional(),
});

// Schema para validar query params de GET /leads.
// Express recibe query params como texto, por eso usamos coerción/conversión en page, limit y clientId.
export const leadQuerySchema = z.object({
  status: z.enum(allowedStatuses).optional(),

  search: z
    .string()
    .trim()
    .min(1, { error: "Search cannot be empty" })
    .max(100, { error: "Search must be at most 100 characters" })
    .optional(),

  clientId: z
    .string()
    .regex(/^[1-9]\d*$/, { error: "Client ID must be a positive number" })
    .transform((value) => Number(value))
    .optional(),

  page: z.coerce
    .number({ error: "Page must be a number" })
    .int({ error: "Page must be an integer" })
    .min(1, { error: "Page must be at least 1" })
    .default(1),

  limit: z.coerce
    .number({ error: "Limit must be a number" })
    .int({ error: "Limit must be an integer" })
    .min(1, { error: "Limit must be at least 1" })
    .max(50, { error: "Limit must be at most 50" })
    .default(10),

  sortBy: z.enum(leadSortFields).default("createdAt"),

  sortOrder: z.enum(sortOrders).default("desc"),
});

// Schema para validar params con ID.
// Express recibe params como string, por eso validamos que sea un número positivo en texto.
export const leadIdParamsSchema = z.object({
  id: z
    .string({ error: "Lead ID is required" })
    .regex(/^[1-9]\d*$/, { error: "Lead ID must be a positive number" }),
});

// Schema para validar el body de PATCH /leads/:id/status.
export const updateLeadStatusBodySchema = z.object({
  status: z.enum(allowedStatuses, {
    error: "Invalid status",
  }),
});

// Schema para asociar o desasociar un lead con un client.
// Si clientId es número positivo, asociamos.
// Si clientId es null, desasociamos.
export const updateLeadClientBodySchema = z.object({
  clientId: z
    .number({ error: "Client ID must be a number or null" })
    .int({ error: "Client ID must be an integer" })
    .positive({ error: "Client ID must be a positive number" })
    .nullable(),
});

// Tipos inferidos desde los schemas.
// Así TypeScript toma los tipos desde Zod y no tenemos que repetirlos manualmente.
export type CreateLeadBody = z.infer<typeof createLeadBodySchema>;
export type LeadQuery = z.infer<typeof leadQuerySchema>;
export type LeadParams = z.infer<typeof leadIdParamsSchema>;
export type UpdateLeadStatusBody = z.infer<typeof updateLeadStatusBodySchema>;
export type UpdateLeadClientBody = z.infer<typeof updateLeadClientBodySchema>;