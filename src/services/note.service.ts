// Importamos Prisma para consultar la base de datos.
import { prisma } from "../lib/prisma.js";

// Importamos tipos propios del dominio note.
import type { CreateNoteInput } from "../types/note.js";

// Lista todas las notas de un lead.
// Si el lead no existe, devuelve error controlado.
export async function getNotesByLeadId(leadId: number) {
  const existingLead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!existingLead) {
    return {
      success: false as const,
      statusCode: 404,
      message: "Lead not found",
    };
  }

  const notes = await prisma.note.findMany({
    where: {
      leadId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    success: true as const,
    notes,
  };
}

// Crea una nota interna para un lead.
// Asociamos la nota al lead y al usuario autenticado.
export async function createNoteForLead(
  leadId: number,
  userId: number,
  input: CreateNoteInput
) {
  const existingLead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!existingLead) {
    return {
      success: false as const,
      statusCode: 404,
      message: "Lead not found",
    };
  }

  const note = await prisma.note.create({
    data: {
      content: input.content,
      leadId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    success: true as const,
    note,
  };
}

// Borra una nota por ID.
// Si la nota no existe, devuelve null.
export async function deleteNote(noteId: number) {
  const existingNote = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  });

  if (!existingNote) {
    return null;
  }

  return prisma.note.delete({
    where: {
      id: noteId,
    },
  });
}