// Importamos tipos de Express.
import type { Request, Response } from "express";

// Importamos el service de dashboard.
import { getDashboardStats } from "../services/dashboard.service.js";

// GET /dashboard/stats
// Devuelve estadísticas generales del CRM.
export async function getDashboardStatsController(
  req: Request,
  res: Response
): Promise<void> {
  const stats = await getDashboardStats();

  res.json(stats);
}