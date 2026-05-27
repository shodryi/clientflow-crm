// Importamos tipos de Express.
import type { NextFunction, Request, Response } from "express";

// Importamos nuestro error personalizado.
import { AppError } from "../errors/app-error.js";

// Middleware para rutas inexistentes.
// Si ninguna ruta anterior respondió, llegamos acá.
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
}