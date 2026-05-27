// Importamos tipos de Express.
import type { NextFunction, Request, Response } from "express";

// Importamos nuestro error personalizado.
import { AppError } from "../errors/app-error.js";

// Representa un error que puede venir desde Prisma.
// No importamos clases internas de Prisma para evitar problemas con Prisma 7 y el cliente generado.
type ErrorWithCode = {
  code?: unknown;
};

// Detecta errores de Prisma que tienen un código tipo P2002, P2025, etc.
function hasPrismaErrorCode(error: unknown): error is { code: string } {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const possibleError = error as ErrorWithCode;

  return typeof possibleError.code === "string";
}

// Detecta error de JSON inválido en el body.
// Por ejemplo, cuando llega un JSON mal cerrado.
function isInvalidJsonError(error: unknown): boolean {
  return error instanceof SyntaxError && "body" in error;
}

// Middleware global de errores.
// Debe ir al final de app.ts, después de todas las rutas.
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Si Express ya empezó a enviar respuesta, delegamos al handler interno.
  if (res.headersSent) {
    next(error);
    return;
  }

  // Errores controlados de nuestra aplicación.
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  // JSON inválido enviado por el cliente.
  if (isInvalidJsonError(error)) {
    res.status(400).json({
      message: "Invalid JSON body",
    });
    return;
  }

  // Errores conocidos de Prisma por código.
  // P2002 = unique constraint failed.
  // P2025 = operación depende de un registro requerido que no existe.
  if (hasPrismaErrorCode(error)) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Unique constraint failed",
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        message: "Required record not found",
      });
      return;
    }
  }

  // Error inesperado.
  // Lo logueamos en consola para debugging, pero no exponemos detalles internos al cliente.
  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
}