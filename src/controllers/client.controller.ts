// Importamos tipos de Express.
import type { Request, Response } from "express";

// Importamos services de client.
import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient,
} from "../services/client.service.js";

// Importamos tipos inferidos desde Zod.
import type {
  ClientParams,
  CreateClientBody,
  UpdateClientBody,
} from "../schemas/client.schema.js";

// Importamos tipos propios del dominio client.
import type { CreateClientInput, UpdateClientInput } from "../types/client.js";

// GET /clients
// Lista todos los clientes.
export async function getClientsController(
  req: Request,
  res: Response
): Promise<void> {
  const clients = await getClients();

  res.json(clients);
}

// GET /clients/:id
// Busca un cliente por ID.
export async function getClientByIdController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as ClientParams;
  const id = Number(params.id);

  const client = await getClientById(id);

  if (!client) {
    res.status(404).json({
      message: "Client not found",
    });
    return;
  }

  res.json(client);
}

// POST /clients
// Crea un cliente nuevo.
export async function createClientController(
  req: Request,
  res: Response
): Promise<void> {
  const body = res.locals.validatedBody as CreateClientBody;

  const input: CreateClientInput = {
    name: body.name,
  };

  // Agregamos opcionales solo si existen.
  if (body.email) {
    input.email = body.email;
  }

  if (body.phone) {
    input.phone = body.phone;
  }

  if (body.company) {
    input.company = body.company;
  }

  const client = await createClient(input);

  res.status(201).json({
    message: "Client created successfully",
    client,
  });
}

// PUT /clients/:id
// Actualiza un cliente existente.
export async function updateClientController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as ClientParams;
  const body = res.locals.validatedBody as UpdateClientBody;

  const id = Number(params.id);

  const input: UpdateClientInput = {};

  // Agregamos campos solo si existen.
  if (body.name) {
    input.name = body.name;
  }

  if (body.email) {
    input.email = body.email;
  }

  if (body.phone) {
    input.phone = body.phone;
  }

  if (body.company) {
    input.company = body.company;
  }

  const client = await updateClient(id, input);

  if (!client) {
    res.status(404).json({
      message: "Client not found",
    });
    return;
  }

  res.json({
    message: "Client updated successfully",
    client,
  });
}

// DELETE /clients/:id
// Borra un cliente existente.
export async function deleteClientController(
  req: Request,
  res: Response
): Promise<void> {
  const params = res.locals.validatedParams as ClientParams;
  const id = Number(params.id);

  const client = await deleteClient(id);

  if (!client) {
    res.status(404).json({
      message: "Client not found",
    });
    return;
  }

  res.json({
    message: "Client deleted successfully",
    client,
  });
}