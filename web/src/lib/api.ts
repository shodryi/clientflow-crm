// Importamos la función que obtiene el token guardado.
import { getToken } from "./auth-storage";

// URL base del backend.
// En desarrollo será http://localhost:3000.
const API_URL = import.meta.env.VITE_API_URL as string;

// Validamos que la variable exista.
// Si falta, mostramos un error claro.
if (!API_URL) {
  throw new Error("VITE_API_URL is required");
}

// Opciones que puede recibir nuestro helper apiRequest.
type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

// Error personalizado para respuestas fallidas de la API.
export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

// Traduce mensajes específicos que vienen del backend.
function translateBackendMessage(message: string): string {
  const messages: Record<string, string> = {
    "Invalid email or password": "Email o contraseña incorrectos.",
    "Email already registered": "Ese email ya está registrado.",
    "Missing or invalid Authorization header":
      "No hay una sesión válida. Iniciá sesión nuevamente.",
    "Invalid or expired token":
      "La sesión expiró o el token no es válido. Iniciá sesión nuevamente.",
    "Lead not found": "Lead no encontrado.",
    "Client not found": "Cliente no encontrado.",
    "Note not found": "Nota no encontrada.",
    "Invalid JSON body": "El JSON enviado es inválido.",
    "Validation error": "Hay datos inválidos. Revisá los campos.",
  };

  return messages[message] ?? message;
}

// Traduce mensajes de validación que vienen dentro de errors[].
function translateValidationIssue(message: string): string {
  const messages: Record<string, string> = {
    "Name is required": "El nombre es obligatorio.",
    "Name cannot be empty": "El nombre no puede estar vacío.",
    "Name must be at most 100 characters":
      "El nombre debe tener como máximo 100 caracteres.",

    "Email is required": "El email es obligatorio.",
    "Invalid email format": "El formato del email no es válido.",

    "Password is required": "La contraseña es obligatoria.",
    "Password must be at least 8 characters":
      "La contraseña debe tener al menos 8 caracteres.",
    "Password must be at most 72 characters":
      "La contraseña debe tener como máximo 72 caracteres.",

    "Phone cannot be empty": "El teléfono no puede estar vacío.",
    "Phone must be at most 30 characters":
      "El teléfono debe tener como máximo 30 caracteres.",

    "Company cannot be empty": "La empresa no puede estar vacía.",
    "Company must be at most 100 characters":
      "La empresa debe tener como máximo 100 caracteres.",

    "Message is required": "El mensaje es obligatorio.",
    "Message must be at most 2000 characters":
      "El mensaje debe tener como máximo 2000 caracteres.",

    "Source cannot be empty": "El origen no puede estar vacío.",
    "Source must be at most 100 characters":
      "El origen debe tener como máximo 100 caracteres.",

    "Content is required": "El contenido es obligatorio.",
    "Content must be at most 1000 characters":
      "El contenido debe tener como máximo 1000 caracteres.",

    "Invalid status": "El estado no es válido.",
    "Lead ID must be a positive number":
      "El ID del lead debe ser un número positivo.",
    "Client ID must be a positive number":
      "El ID del cliente debe ser un número positivo.",
    "Note ID must be a positive number":
      "El ID de la nota debe ser un número positivo.",

    "Page must be at least 1": "La página debe ser como mínimo 1.",
    "Limit must be at least 1": "El límite debe ser como mínimo 1.",
    "Limit must be at most 50": "El límite debe ser como máximo 50.",
    "At least one field is required":
      "Tenés que completar al menos un campo.",
  };

  return messages[message] ?? message;
}

// Intenta construir un mensaje de error amigable desde la respuesta del backend.
function getApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "La solicitud falló.";
  }

  const responseData = data as {
    message?: unknown;
    errors?: Array<{
      field?: string;
      message?: string;
    }>;
  };

  if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
    const translatedErrors = responseData.errors
      .map((error) => translateValidationIssue(error.message ?? ""))
      .filter(Boolean);

    return translatedErrors.join(" ");
  }

  if (typeof responseData.message === "string") {
    return translateBackendMessage(responseData.message);
  }

  return "La solicitud falló.";
}

// Helper reutilizable para llamar al backend.
// Agrega JSON, Authorization y manejo básico de errores.
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Si la request requiere auth, agregamos el token JWT.
  if (options.auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      `No se pudo conectar con la API. Verificá que el backend esté encendido y corriendo en ${API_URL}.`,
      0
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getApiErrorMessage(data), response.status);
  }

  return data as T;
}