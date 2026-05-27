// Importamos bcryptjs para hashear y comparar passwords.
import bcrypt from "bcryptjs";

// Importamos Prisma para consultar/crear usuarios en la base.
import { prisma } from "../lib/prisma.js";

// Importamos la función que crea tokens JWT.
import { signAccessToken } from "../lib/jwt.js";

// Importamos tipos propios de auth.
import type { LoginInput, PublicUser, RegisterInput } from "../types/auth.js";

// Cantidad de rondas para bcrypt.
// 10 es un valor común para desarrollo y proyectos chicos.
const SALT_ROUNDS = 10;

// Tipo mínimo de usuario interno que usamos en este service.
// Incluye password porque lo necesitamos para login.
type UserWithPassword = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

// Convierte un usuario de base de datos en un usuario público.
// Nunca devolvemos password al cliente.
function toPublicUser(user: UserWithPassword): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Registra un usuario nuevo.
// Si el email ya existe, devuelve un error controlado.
export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    return {
      success: false as const,
      statusCode: 409,
      message: "Email already registered",
    };
  }

  // Nunca guardamos el password plano.
  // Guardamos solo el hash.
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
  });

  const token = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return {
    success: true as const,
    user: toPublicUser(user),
    token,
  };
}

// Inicia sesión.
// Usamos mensaje genérico para no revelar si falló el email o el password.
export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    return {
      success: false as const,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    return {
      success: false as const,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const token = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return {
    success: true as const,
    user: toPublicUser(user),
    token,
  };
}

// Busca el usuario autenticado actual por ID.
export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}