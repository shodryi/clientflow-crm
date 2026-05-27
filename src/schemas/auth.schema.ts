// Importamos Zod para crear schemas de validación.
import * as z from "zod";

// Schema para validar POST /auth/register.
export const registerBodySchema = z.object({
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

  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" })
    .max(72, { error: "Password must be at most 72 characters" }),
});

// Schema para validar POST /auth/login.
export const loginBodySchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Invalid email format" })),

  password: z.string({ error: "Password is required" }).min(1, {
    error: "Password is required",
  }),
});

// Tipos inferidos desde Zod.
export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;