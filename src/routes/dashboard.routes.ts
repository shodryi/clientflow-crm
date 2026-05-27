// Importamos Router para definir rutas separadas.
import { Router } from "express";

// Importamos controller de dashboard.
import { getDashboardStatsController } from "../controllers/dashboard.controller.js";

// Importamos middleware de autenticación.
import { requireAuth } from "../middlewares/auth.middleware.js";

// Creamos router de dashboard.
const router = Router();

// Todas las rutas de dashboard son privadas.
router.use(requireAuth);

// GET /dashboard/stats
// Devuelve estadísticas generales del CRM.
router.get("/stats", getDashboardStatsController);

export default router;