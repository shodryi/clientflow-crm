// Importamos Zod para crear schemas de validación.
import * as z from "zod";

// Schema para validar params con ID.
// Express recibe params como string, por eso validamos texto numérico positivo.
export const clientIdParamsSchema = z.object({
  id: z
    .string({ error: "Client ID is required" })
    .regex(/^[1-9]\d*$/, { error: "Client ID must be a positive number" }),
});

// Schema para crear clientes.
// POST /clients
export const createClientBodySchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters" }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email format" }))
    .optional(),

  phone: z
    .string()
    .trim()
    .min(1, { error: "Phone cannot be empty" })
    .max(30, { error: "Phone must be at most 30 characters" })
    .optional(),

  company: z
    .string()
    .trim()
    .min(1, { error: "Company cannot be empty" })
    .max(100, { error: "Company must be at most 100 characters" })
    .optional(),
});

// Schema para actualizar clientes.
// PUT /clients/:id
export const updateClientBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: "Name cannot be empty" })
      .max(100, { error: "Name must be at most 100 characters" })
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "Invalid email format" }))
      .optional(),

    phone: z
      .string()
      .trim()
      .min(1, { error: "Phone cannot be empty" })
      .max(30, { error: "Phone must be at most 30 characters" })
      .optional(),

    company: z
      .string()
      .trim()
      .min(1, { error: "Company cannot be empty" })
      .max(100, { error: "Company must be at most 100 characters" })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field is required",
  });

// Tipos inferidos desde Zod.
export type ClientParams = z.infer<typeof clientIdParamsSchema>;
export type CreateClientBody = z.infer<typeof createClientBodySchema>;
export type UpdateClientBody = z.infer<typeof updateClientBodySchema>;