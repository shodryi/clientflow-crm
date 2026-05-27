// Usuario público asociado a una nota.
// El backend devuelve id, name y email del usuario que creó la nota.
export type NoteUser = {
  id: number;
  name: string;
  email: string;
};

// Nota interna de un lead.
export type Note = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  leadId: number;
  userId: number | null;
  user?: NoteUser | null;
};

// Respuesta de POST /leads/:id/notes.
export type CreateNoteResponse = {
  message: string;
  note: Note;
};

// Respuesta de DELETE /notes/:id.
export type DeleteNoteResponse = {
  message: string;
  note: Note;
};