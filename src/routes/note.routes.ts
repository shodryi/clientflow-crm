// Importamos Router para definir rutas separadas de notas.
import { Router } from "express";

// Importamos controller de notes.
import { deleteNoteController } from "../controllers/note.controller.js";

// Importamos middleware de autenticación.
import { requireAuth } from "../middlewares/auth.middleware.js";

// Importamos middleware de validación.
import { validate } from "../middlewares/validate.js";

// Importamos schema para validar ID de nota.
import { noteIdParamsSchema } from "../schemas/note.schema.js";

// Creamos router de notes.
const router = Router();

// Todas las rutas de notes son privadas.
router.use(requireAuth);

// DELETE /notes/:id
// Borra una nota por ID.
router.delete(
  "/:id",
  validate(noteIdParamsSchema, "params"),
  deleteNoteController
);

export default router;