// Importamos Zod para crear schemas de validación.
import * as z from "zod";

// Schema para validar params con ID de nota.
// Express recibe params como string, por eso validamos texto numérico positivo.
export const noteIdParamsSchema = z.object({
  id: z
    .string({ error: "Note ID is required" })
    .regex(/^[1-9]\d*$/, { error: "Note ID must be a positive number" }),
});

// Schema para validar el body de POST /leads/:id/notes.
export const createNoteBodySchema = z.object({
  content: z
    .string({ error: "Content is required" })
    .trim()
    .min(1, { error: "Content is required" })
    .max(1000, { error: "Content must be at most 1000 characters" }),
});

// Tipos inferidos desde Zod.
export type NoteParams = z.infer<typeof noteIdParamsSchema>;
export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;