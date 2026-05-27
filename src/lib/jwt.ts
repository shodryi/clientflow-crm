// Importamos herramientas de jose para crear y verificar JWT.
import { SignJWT, jwtVerify } from "jose";

// Payload interno que vamos a guardar dentro del token.
export type AccessTokenPayload = {
  userId: number;
  email: string;
};

// Obtiene el secret desde .env y lo convierte al formato que jose necesita.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return new TextEncoder().encode(secret);
}

// Crea un token JWT para un usuario autenticado.
export async function signAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT({
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

// Verifica un token JWT.
// Si es válido, devuelve userId y email.
// Si no es válido, devuelve null.
export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const secret = getJwtSecret();

    const { payload } = await jwtVerify(token, secret);

    const userId = Number(payload.sub);

    if (!payload.sub || Number.isNaN(userId)) {
      return null;
    }

    if (typeof payload.email !== "string") {
      return null;
    }

    return {
      userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}