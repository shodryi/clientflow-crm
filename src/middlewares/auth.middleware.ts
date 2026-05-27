// Importamos tipos de Express.
import type { NextFunction, Request, Response } from "express";

// Importamos función para verificar JWT.
import { verifyAccessToken } from "../lib/jwt.js";

// Middleware para proteger rutas privadas.
// Requiere header: Authorization: Bearer TOKEN
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Missing or invalid Authorization header",
    });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  const payload = await verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
    return;
  }

  // Guardamos el usuario autenticado en res.locals.
  // Así el controller puede leerlo sin volver a verificar el token.
  res.locals.authUser = payload;

  next();
}