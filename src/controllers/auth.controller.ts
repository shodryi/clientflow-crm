// Importamos tipos de Express.
import type { Request, Response } from "express";

// Importamos services de auth.
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service.js";

// Importamos tipos inferidos desde Zod.
import type { LoginBody, RegisterBody } from "../schemas/auth.schema.js";

// Importamos el tipo del payload autenticado.
import type { AccessTokenPayload } from "../lib/jwt.js";

// POST /auth/register
// Registra un usuario y devuelve token.
export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  const body = res.locals.validatedBody as RegisterBody;

  const result = await registerUser(body);

  if (!result.success) {
    res.status(result.statusCode).json({
      message: result.message,
    });
    return;
  }

  res.status(201).json({
    message: "User registered successfully",
    user: result.user,
    token: result.token,
  });
}

// POST /auth/login
// Inicia sesión y devuelve token.
export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const body = res.locals.validatedBody as LoginBody;

  const result = await loginUser(body);

  if (!result.success) {
    res.status(result.statusCode).json({
      message: result.message,
    });
    return;
  }

  res.json({
    message: "Login successful",
    user: result.user,
    token: result.token,
  });
}

// GET /auth/me
// Devuelve los datos del usuario autenticado.
export async function meController(
  req: Request,
  res: Response
): Promise<void> {
  const authUser = res.locals.authUser as AccessTokenPayload;

  const user = await getCurrentUser(authUser.userId);

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }

  res.json({
    user,
  });
}