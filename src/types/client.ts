// Datos necesarios para crear un cliente.
// Algunos campos son opcionales porque no siempre tendremos toda la información.
export type CreateClientInput = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
};

// Datos permitidos para actualizar un cliente.
// Todos son opcionales porque en un PUT/PATCH podemos modificar solo algunos campos.
export type UpdateClientInput = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
};