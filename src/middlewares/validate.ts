// Importamos tipos de Express para tipar el middleware.
import type { NextFunction, Request, Response } from "express";

// Importamos Zod para tipar schemas y errores.
import * as z from "zod";

// Partes de la request que podemos validar.
type RequestPart = "body" | "query" | "params";

// Convierte los errores de Zod en una respuesta más simple para la API.
function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "request",
    message: issue.message,
  }));
}

// Devuelve el nombre que vamos a usar dentro de res.locals.
// No modificamos req.body, req.query ni req.params directamente.
function getValidatedKey(part: RequestPart) {
  if (part === "body") return "validatedBody";
  if (part === "query") return "validatedQuery";
  return "validatedParams";
}

// Middleware reutilizable para validar body, query o params.
// Si falla, responde 400.
// Si pasa, guarda los datos validados en res.locals.
export function validate(schema: z.ZodType, part: RequestPart) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: formatZodErrors(result.error),
      });
      return;
    }

    // En Express 5 no podemos reasignar req.query porque es un getter.
    // Por eso guardamos el resultado validado en res.locals.
    const key = getValidatedKey(part);
    res.locals[key] = result.data;

    next();
  };
}