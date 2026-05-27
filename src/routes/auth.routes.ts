// Importamos Router para crear rutas de auth.
import { Router } from "express";

// Importamos controllers de auth.
import {
  loginController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";

// Importamos middleware de autenticación.
import { requireAuth } from "../middlewares/auth.middleware.js";

// Importamos middleware de validación.
import { validate } from "../middlewares/validate.js";

// Importamos schemas de auth.
import { loginBodySchema, registerBodySchema } from "../schemas/auth.schema.js";

const router = Router();

// POST /auth/register
// Valida body y registra usuario.
router.post("/register", validate(registerBodySchema, "body"), registerController);

// POST /auth/login
// Valida body e inicia sesión.
router.post("/login", validate(loginBodySchema, "body"), loginController);

// GET /auth/me
// Ruta protegida: requiere token válido.
router.get("/me", requireAuth, meController);

export default router;