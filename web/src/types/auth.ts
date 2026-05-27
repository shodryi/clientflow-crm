// Representa el usuario público que devuelve el backend.
// No tiene password porque el backend nunca devuelve passwords.
export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

// Respuesta esperada de POST /auth/login.
export type LoginResponse = {
  message: string;
  user: User;
  token: string;
};

// Respuesta esperada de GET /auth/me.
export type MeResponse = {
  user: User;
};