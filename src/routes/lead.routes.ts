// Importamos Router para definir rutas separadas de leads.
import { Router } from "express";

// Importamos controllers de leads.
import {
  createPublicLeadController,
  deleteLeadController,
  getLeadByIdController,
  getLeadsController,
  updateLeadClientController,
  updateLeadStatusController,
} from "../controllers/lead.controller.js";

// Importamos controllers de notes.
// Estas rutas viven bajo /leads/:id/notes porque pertenecen a un lead.
import {
  createLeadNoteController,
  getLeadNotesController,
} from "../controllers/note.controller.js";

// Importamos middleware de autenticación.
import { requireAuth } from "../middlewares/auth.middleware.js";

// Importamos el middleware reutilizable de validación.
import { validate } from "../middlewares/validate.js";

// Importamos los schemas de Zod para validar cada endpoint.
import {
  createLeadBodySchema,
  leadIdParamsSchema,
  leadQuerySchema,
  updateLeadClientBodySchema,
  updateLeadStatusBodySchema,
} from "../schemas/lead.schema.js";

// Importamos schema de notes.
import { createNoteBodySchema } from "../schemas/note.schema.js";

// Creamos el router de leads.
const router = Router();

// GET /leads
// Ruta privada: requiere token.
// Valida query params y luego lista leads.
router.get("/", requireAuth, validate(leadQuerySchema, "query"), getLeadsController);

// POST /leads/public
// Ruta pública: cualquiera puede crear un lead desde una web.
router.post(
  "/public",
  validate(createLeadBodySchema, "body"),
  createPublicLeadController
);

// GET /leads/:id/notes
// Ruta privada: lista notas internas de un lead.
router.get(
  "/:id/notes",
  requireAuth,
  validate(leadIdParamsSchema, "params"),
  getLeadNotesController
);

// POST /leads/:id/notes
// Ruta privada: crea una nota interna para un lead.
router.post(
  "/:id/notes",
  requireAuth,
  validate(leadIdParamsSchema, "params"),
  validate(createNoteBodySchema, "body"),
  createLeadNoteController
);

// GET /leads/:id
// Ruta privada: requiere token.
// Valida params y luego busca un lead por ID.
router.get(
  "/:id",
  requireAuth,
  validate(leadIdParamsSchema, "params"),
  getLeadByIdController
);

// DELETE /leads/:id
// Ruta privada: requiere token.
// Valida params y luego borra el lead.
router.delete(
  "/:id",
  requireAuth,
  validate(leadIdParamsSchema, "params"),
  deleteLeadController
);

// PATCH /leads/:id/client
// Ruta privada: requiere token.
// Valida params, valida body y luego asocia/desasocia un client.
router.patch(
  "/:id/client",
  requireAuth,
  validate(leadIdParamsSchema, "params"),
  validate(updateLeadClientBodySchema, "body"),
  updateLeadClientController
);

// PATCH /leads/:id/status
// Ruta privada: requiere token.
// Valida params, valida body y luego actualiza el estado.
router.patch(
  "/:id/status",
  requireAuth,
  validate(leadIdParamsSchema, "params"),
  validate(updateLeadStatusBodySchema, "body"),
  updateLeadStatusController
);

// Exportamos el router para conectarlo en app.ts.
export default router;