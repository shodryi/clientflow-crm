// Importamos Router para definir rutas separadas.
import { Router } from "express";

// Importamos controllers de clients.
import {
  createClientController,
  deleteClientController,
  getClientByIdController,
  getClientsController,
  updateClientController,
} from "../controllers/client.controller.js";

// Importamos middleware de autenticación.
import { requireAuth } from "../middlewares/auth.middleware.js";

// Importamos middleware de validación.
import { validate } from "../middlewares/validate.js";

// Importamos schemas de validación.
import {
  clientIdParamsSchema,
  createClientBodySchema,
  updateClientBodySchema,
} from "../schemas/client.schema.js";

// Creamos router de clients.
const router = Router();

// Todas las rutas de clients son privadas.
router.use(requireAuth);

// GET /clients
// Lista clientes.
router.get("/", getClientsController);

// POST /clients
// Crea cliente.
router.post("/", validate(createClientBodySchema, "body"), createClientController);

// GET /clients/:id
// Busca cliente por ID.
router.get(
  "/:id",
  validate(clientIdParamsSchema, "params"),
  getClientByIdController
);

// PUT /clients/:id
// Actualiza cliente por ID.
router.put(
  "/:id",
  validate(clientIdParamsSchema, "params"),
  validate(updateClientBodySchema, "body"),
  updateClientController
);

// DELETE /clients/:id
// Borra cliente por ID.
router.delete(
  "/:id",
  validate(clientIdParamsSchema, "params"),
  deleteClientController
);

export default router;