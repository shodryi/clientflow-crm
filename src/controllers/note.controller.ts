// Importamos tipos de Express.
import type { Request, Response } from "express";

// Importamos el tipo del usuario autenticado guardado en el JWT.
import type { AccessTokenPayload } from "../lib/jwt.js";

// Importamos tipos inferidos desde schemas.
import type { LeadParams } from "../schemas/lead.schema.js";
import type { CreateNoteBody, NoteParams } from "../schemas/note.schema.js";

// Importamos services de note.
import {
  createNoteForLead,
  deleteNote,
  getNotesByLeadId,
} from "../services/note.service.js";

// Importamos tipo propio para construir el input del service.
import type { CreateNoteInput } from "../types/note.js";

// GET /leads/:id/notes
// Lista todas las notas internas de un lead.
export async function getLeadNotesController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as LeadParams;
  const leadId = Number(params.id);

  const result = await getNotesByLeadId(leadId);

  if (!result.success) {
    res.status(result.statusCode).json({
      message: result.message,
    });
    return;
  }

  res.json(result.notes);
}

// POST /leads/:id/notes
// Crea una nota interna para un lead.
export async function createLeadNoteController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as LeadParams;
  const body = res.locals.validatedBody as CreateNoteBody;
  const authUser = res.locals.authUser as AccessTokenPayload;

  const leadId = Number(params.id);

  const input: CreateNoteInput = {
    content: body.content,
  };

  const result = await createNoteForLead(leadId, authUser.userId, input);

  if (!result.success) {
    res.status(result.statusCode).json({
      message: result.message,
    });
    return;
  }

  res.status(201).json({
    message: "Note created successfully",
    note: result.note,
  });
}

// DELETE /notes/:id
// Borra una nota interna por ID.
export async function deleteNoteController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as NoteParams;
  const noteId = Number(params.id);

  const note = await deleteNote(noteId);

  if (!note) {
    res.status(404).json({
      message: "Note not found",
    });
    return;
  }

  res.json({
    message: "Note deleted successfully",
    note,
  });
}