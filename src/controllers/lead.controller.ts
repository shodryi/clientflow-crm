// Importamos tipos de Express para tipar req y res.
import type { Request, Response } from "express";

// Importamos las funciones del service.
// Estas funciones consultan la base de datos usando Prisma.
import {
  createLead,
  deleteLead,
  getLeadById,
  getLeads,
  updateLeadClient,
  updateLeadStatus,
} from "../services/lead.service.js";

// Importamos tipos inferidos desde los schemas de Zod.
import type {
  CreateLeadBody,
  LeadParams,
  LeadQuery,
  UpdateLeadClientBody,
  UpdateLeadStatusBody,
} from "../schemas/lead.schema.js";

// Importamos el tipo CreateLeadInput para construir el objeto del service.
import type { CreateLeadInput, GetLeadsInput } from "../types/lead.js";

// GET /leads
// Lista leads desde la base de datos, con filtros, búsqueda, ordenamiento y paginación.
export async function getLeadsController(
  req: Request,
  res: Response
): Promise<void> {
  // Tomamos la query ya validada por Zod desde res.locals.
  const query = res.locals.validatedQuery as LeadQuery;

  // Creamos el input base con los campos obligatorios.
  // Estos tienen default en Zod, por eso siempre deberían venir.
  const input: GetLeadsInput = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };

  // Agregamos status solo si realmente existe.
  // Así evitamos mandar status: undefined.
  if (query.status) {
    input.status = query.status;
  }

  // Agregamos search solo si realmente existe.
  // Así evitamos mandar search: undefined.
  if (query.search) {
    input.search = query.search;
  }

  // Agregamos clientId solo si realmente existe.
  // Usamos !== undefined porque clientId ya viene transformado a number por Zod.
  if (query.clientId !== undefined) {
    input.clientId = query.clientId;
  }

  const result = await getLeads(input);

  res.json(result);
}

// POST /leads/public
// Crea un lead real en la base de datos.
// El body ya fue validado por Zod antes de llegar acá.
export async function createPublicLeadController(req: Request, res: Response): Promise<void> {
  // Tomamos el body ya validado y limpiado por Zod.
  const body = res.locals.validatedBody as CreateLeadBody;
  const { name, email, phone, message, source } = body;

  const leadInput: CreateLeadInput = {
    name,
    email,
    message,
  };

  // Agregamos opcionales solo si existen.
  // Esto evita problemas con exactOptionalPropertyTypes.
  if (phone) {
    leadInput.phone = phone;
  }
  if (source) {
    leadInput.source = source;
  }

  const lead = await createLead(leadInput);
  
  res.status(201).json({
    message: "Lead created successfully",
    lead,
  });
}

// GET /leads/:id
// Busca un lead específico en la base por ID.
// El param id ya fue validado por Zod antes de llegar acá.
export async function getLeadByIdController(req: Request, res: Response): Promise<void> {
  // Tomamos params validados desde res.locals.
  const params = res.locals.validatedParams as LeadParams;
  const id = Number(params.id);
  
  const lead = await getLeadById(id);

  if (!lead) {
    res.status(404).json({
      message: "Lead not found",
    });
    return;
  }
  
  res.json(lead);
}

// PATCH /leads/:id/status
// Actualiza el estado de un lead en la base.
// Params y body ya fueron validados por Zod.
export async function updateLeadStatusController(req: Request, res: Response): Promise<void> {
  // Tomamos params y body validados desde res.locals.
  const params = res.locals.validatedParams as LeadParams;
  const body = res.locals.validatedBody as UpdateLeadStatusBody;
  const id = Number(params.id);
  const { status } = body;
  
  const lead = await updateLeadStatus(id, status);

  if (!lead) {
    res.status(404).json({
      message: "Lead not found",
    });
    return;
  }
  
  res.json({
    message: "Lead status updated successfully",
    lead,
  });
}

// PATCH /leads/:id/client
// Asocia o desasocia un lead con un cliente.
export async function updateLeadClientController(req: Request, res: Response): Promise<void> {
  const params = res.locals.validatedParams as LeadParams;
  const body = res.locals.validatedBody as UpdateLeadClientBody;
  const id = Number(params.id);
  const { clientId } = body;
  
  const result = await updateLeadClient(id, clientId);

  if (!result.success) {
    res.status(result.statusCode).json({
      message: result.message,
    });
    return;
  }
  
  res.json({
    message: clientId === null 
      ? "Lead detached from client successfully" 
      : "Lead attached to client successfully",
    lead: result.lead,
  });
}

// DELETE /leads/:id
// Borra un lead específico.
// También borra sus notas internas desde el service.
export async function deleteLeadController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as LeadParams;
  const id = Number(params.id);

  const lead = await deleteLead(id);

  if (!lead) {
    res.status(404).json({
      message: "Lead not found",
    });
    return;
  }

  res.json({
    message: "Lead deleted successfully",
    lead,
  });
}