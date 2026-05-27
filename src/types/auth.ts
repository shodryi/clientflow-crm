// Datos necesarios para registrar un usuario.
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

// Datos necesarios para iniciar sesión.
export type LoginInput = {
  email: string;
  password: string;
};

// Usuario público.
// No incluimos password por seguridad.
export type PublicUser = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};