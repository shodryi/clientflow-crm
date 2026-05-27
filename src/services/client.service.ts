// Importamos Prisma para consultar la base de datos.
import { prisma } from "../lib/prisma.js";

// Importamos tipos propios del dominio client.
import type { CreateClientInput, UpdateClientInput } from "../types/client.js";
import { fromPrismaLeadStatus } from "../constants/lead-statuses.js";

// Devuelve todos los clientes.
// Incluimos un conteo de leads asociados para que sea más útil.
export async function getClients() {
  return prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          leads: true,
        },
      },
    },
  });
}

// Busca un cliente por ID.
// Incluye sus leads asociados para ver la relación Client -> Lead.
// También convierte los estados de Prisma al formato público de la API.
export async function getClientById(id: number) {
  const client = await prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      leads: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!client) {
    return null;
  }

  return {
    ...client,
    leads: client.leads.map((lead) => ({
      ...lead,
      status: fromPrismaLeadStatus(lead.status),
    })),
  };
}

// Crea un cliente nuevo.
export async function createClient(input: CreateClientInput) {
  return prisma.client.create({
    data: {
      name: input.name,

      // Agregamos opcionales solo si existen.
      // Esto evita problemas con exactOptionalPropertyTypes.
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.company ? { company: input.company } : {}),
    },
  });
}

// Actualiza un cliente existente.
// Si no existe, devuelve null.
export async function updateClient(id: number, input: UpdateClientInput) {
  const existingClient = await prisma.client.findUnique({
    where: {
      id,
    },
  });

  if (!existingClient) {
    return null;
  }

  return prisma.client.update({
    where: {
      id,
    },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.company ? { company: input.company } : {}),
    },
  });
}

// Borra un cliente.
// Antes de borrarlo, desasocia sus leads para no romper la relación.
export async function deleteClient(id: number) {
  const existingClient = await prisma.client.findUnique({
    where: {
      id,
    },
  });

  if (!existingClient) {
    return null;
  }

  // Prisma permite ejecutar operaciones CRUD sobre la base.
  // Acá usamos una transacción para asegurar que ambas operaciones se hagan juntas.
  const [, deletedClient] = await prisma.$transaction([
    prisma.lead.updateMany({
      where: {
        clientId: id,
      },
      data: {
        clientId: null,
      },
    }),

    prisma.client.delete({
      where: {
        id,
      },
    }),
  ]);

  return deletedClient;
}