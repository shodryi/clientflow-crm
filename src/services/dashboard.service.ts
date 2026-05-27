// Importamos los estados permitidos y el helper para convertir estados de Prisma a API.
import {
  allowedStatuses,
  fromPrismaLeadStatus,
} from "../constants/lead-statuses.js";

// Importamos Prisma para consultar la base de datos.
import { prisma } from "../lib/prisma.js";

// Importamos el tipo público de LeadStatus.
import type { LeadStatus } from "../constants/lead-statuses.js";

// Obtiene el inicio del día actual.
// Sirve para contar leads creados hoy.
function getStartOfToday(): Date {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}

// Obtiene el inicio del mes actual.
// Sirve para contar leads creados este mes.
function getStartOfMonth(): Date {
  const date = new Date();

  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return date;
}

// Calcula porcentaje de forma segura.
// Si total es 0, devuelve 0 para evitar divisiones inválidas.
function calculatePercentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Number(((part / total) * 100).toFixed(2));
}

// Devuelve estadísticas generales del mini CRM.
// Usamos varias consultas en una transacción para obtener un snapshot consistente.
export async function getDashboardStats() {
  const startOfToday = getStartOfToday();
  const startOfMonth = getStartOfMonth();

  const [
    totalLeads,
    totalClients,
    totalNotes,
    leadsCreatedToday,
    leadsCreatedThisMonth,
    closedLeads,
    lostLeads,
    leadsByStatusRaw,
    leadsBySourceRaw,
    recentLeads,
  ] = await prisma.$transaction([
    prisma.lead.count(),

    prisma.client.count(),

    prisma.note.count(),

    prisma.lead.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),

    prisma.lead.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),

    prisma.lead.count({
      where: {
        status: "CLOSED",
      },
    }),

    prisma.lead.count({
      where: {
        status: "LOST",
      },
    }),

    prisma.lead.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),

    prisma.lead.groupBy({
      by: ["source"],
      _count: {
        _all: true,
      },
    }),

    prisma.lead.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
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

  // Inicializamos todos los estados en 0.
  // Así aunque no haya leads "closed", igual aparece closed: 0.
  const statusCounts = Object.fromEntries(
    allowedStatuses.map((status) => [status, 0])
  ) as Record<LeadStatus, number>;

  // Completamos los estados que sí vinieron desde Prisma.
  for (const item of leadsByStatusRaw) {
    const publicStatus = fromPrismaLeadStatus(item.status);

    statusCounts[publicStatus] = item._count._all;
  }

  const leadsByStatus = allowedStatuses.map((status) => ({
    status,
    count: statusCounts[status],
  }));

  // Agrupamos por source y ordenamos de mayor a menor cantidad.
  const leadsBySource = leadsBySourceRaw
    .map((item) => ({
      source: item.source,
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totals: {
      leads: totalLeads,
      clients: totalClients,
      notes: totalNotes,
    },

    activity: {
      leadsCreatedToday,
      leadsCreatedThisMonth,
    },

    performance: {
      closedLeads,
      lostLeads,
      conversionRate: calculatePercentage(closedLeads, totalLeads),
      lostRate: calculatePercentage(lostLeads, totalLeads),
    },

    leadsByStatus,

    leadsBySource,

    recentLeads: recentLeads.map((lead) => ({
      ...lead,
      status: fromPrismaLeadStatus(lead.status),
    })),
  };
}