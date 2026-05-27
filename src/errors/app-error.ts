// Error personalizado para errores controlados de la aplicación.
// Por ejemplo: ruta no encontrada, permisos, recurso inexistente, etc.
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;

    // Mejora el stack trace para que apunte al lugar donde se creó el error.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}