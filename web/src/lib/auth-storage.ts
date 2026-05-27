// Clave que vamos a usar para guardar el token en localStorage.
const TOKEN_KEY = "clientflow_token";

// Guarda el token JWT en el navegador.
// localStorage persiste datos entre sesiones del navegador.
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Obtiene el token guardado.
// Si no existe, devuelve null.
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Elimina el token guardado.
// Lo usamos al cerrar sesión.
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}