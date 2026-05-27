// Importamos tipos generados por Prisma.
// Los usamos para tipar filtros y ordenamientos.
import type { Prisma } from "../generated/prisma/client.js";

// Importamos la instancia de Prisma para consultar la base de datos.
import { prisma } from "../lib/prisma.js";

// Importamos helpers para convertir estados entre API y Prisma.
import {
  fromPrismaLeadStatus,
  toPrismaLeadStatus,
} from "../constants/lead-statuses.js";

// Importamos tipos propios de nuestra API.
import type {
  CreateLeadInput,
  GetLeadsInput,
  LeadSortBy,
  LeadStatus,
  SortOrder,
} from "../types/lead.js";

// Construye el filtro where para Prisma según los query params recibidos.
function buildLeadWhere(input: GetLeadsInput): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  // Filtro por estado.
  if (input.status) {
    where.status = toPrismaLeadStatus(input.status);
  }

  // Filtro por cliente asociado.
  if (input.clientId) {
    where.clientId = input.clientId;
  }

  // Búsqueda simple por nombre, email, mensaje o source.
  if (input.search) {
    where.OR = [
      {
        name: {
          contains: input.search,
        },
      },
      {
        email: {
          contains: input.search,
        },
      },
      {
        message: {
          contains: input.search,
        },
      },
      {
        source: {
          contains: input.search,
        },
      },
    ];
  }

  return where;
}

// Construye el orderBy para Prisma.
// Solo permitimos campos definidos en LeadSortBy para evitar ordenar por cualquier cosa.
function buildLeadOrderBy(
  sortBy: LeadSortBy,
  sortOrder: SortOrder
): Prisma.LeadOrderByWithRelationInput {
  return {
    [sortBy]: sortOrder,
  };
}

// Devuelve leads desde la base con filtros, búsqueda, ordenamiento y paginación.
export async function getLeads(input: GetLeadsInput) {
  const where = buildLeadWhere(input);
  const orderBy = buildLeadOrderBy(input.sortBy, input.sortOrder);

  // skip indica cuántos registros saltar.
  // take indica cuántos registros traer.
  const skip = (input.page - 1) * input.limit;
  const take = input.limit;

  const [total, leads] = await prisma.$transaction([
    prisma.lead.count({
      where,
    }),

    prisma.lead.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        client: true,
        _count: {
          select: {
            notes: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / input.limit);

  return {
    data: leads.map((lead) => ({
      ...lead,
      status: fromPrismaLeadStatus(lead.status),
    })),
    pagination: {
      total,
      page: input.page,
      limit: input.limit,
      totalPages,
      hasNextPage: input.page < totalPages,
      hasPreviousPage: input.page > 1,
    },
  };
}

// Busca un lead por ID en la base.
// Devuelve null si no lo encuentra.
// Incluye client y notes para que el detalle del lead sea más útil.
export async function getLeadById(id: number) {
  const lead = await prisma.lead.findUnique({
    where: {
      id,
    },
    include: {
      client: true,
      notes: {
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
      },
    },
  });

  if (!lead) {
    return null;
  }

  return {
    ...lead,
    status: fromPrismaLeadStatus(lead.status),
  };
}

// Crea un nuevo lead en la base de datos.
export async function createLead(input: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
      source: input.source || "website",
      status: toPrismaLeadStatus("new"),

      // Si phone existe, lo agregamos.
      // Si no existe, no mandamos ese campo.
      ...(input.phone ? { phone: input.phone } : {}),
    },
  });

  return {
    ...lead,
    status: fromPrismaLeadStatus(lead.status),
  };
}

// Actualiza el status de un lead en la base.
// Si el lead no existe, devuelve null.
export async function updateLeadStatus(id: number, status: LeadStatus) {
  const existingLead = await prisma.lead.findUnique({
    where: {
      id,
    },
  });

  if (!existingLead) {
    return null;
  }

  const lead = await prisma.lead.update({
    where: {
      id,
    },
    data: {
      status: toPrismaLeadStatus(status),
    },
  });

  return {
    ...lead,
    status: fromPrismaLeadStatus(lead.status),
  };
}

// Asocia o desasocia un lead con un cliente.
// Si clientId es número, intenta asociarlo.
// Si clientId es null, desasocia el lead.
export async function updateLeadClient(id: number, clientId: number | null) {
  const existingLead = await prisma.lead.findUnique({
    where: {
      id,
    },
  });

  if (!existingLead) {
    return {
      success: false as const,
      statusCode: 404,
      message: "Lead not found",
    };
  }

  // Si clientId no es null, verificamos que ese cliente exista.
  if (clientId !== null) {
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!existingClient) {
      return {
        success: false as const,
        statusCode: 404,
        message: "Client not found",
      };
    }
  }

  const lead = await prisma.lead.update({
    where: {
      id,
    },
    data: {
      clientId,
    },
    include: {
      client: true,
    },
  });

  return {
    success: true as const,
    lead: {
      ...lead,
      status: fromPrismaLeadStatus(lead.status),
    },
  };
}

// Borra un lead por ID.
// Antes de borrar el lead, borramos sus notas internas.
// Esto evita errores por la relación Note -> Lead.
export async function deleteLead(id: number) {
  const existingLead = await prisma.lead.findUnique({
    where: {
      id,
    },
  });

  if (!existingLead) {
    return null;
  }

  // Usamos una transacción para que ambas operaciones se hagan juntas:
  // 1. borrar notas del lead
  // 2. borrar el lead
  const [, deletedLead] = await prisma.$transaction([
    prisma.note.deleteMany({
      where: {
        leadId: id,
      },
    }),

    prisma.lead.delete({
      where: {
        id,
      },
    }),
  ]);

  return {
    ...deletedLead,
    status: fromPrismaLeadStatus(deletedLead.status),
  };
}