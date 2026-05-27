import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiRequest } from "../lib/api";
import { getToken, removeToken, saveToken } from "../lib/auth-storage";
import type { LoginResponse, MeResponse, User } from "../types/auth";

// Datos disponibles desde cualquier componente que use useAuth().
type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Creamos el contexto de autenticación.
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider que envuelve toda la app.
// Se encarga de mantener usuario/token en memoria.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar la app, si hay token guardado, intentamos obtener el usuario actual.
  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<MeResponse>("/auth/me", {
          auth: true,
        });

        setUser(response.user);
      } catch {
        removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  // Login real contra POST /auth/login.
  async function login(email: string, password: string): Promise<void> {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    });

    saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }

  // Cierra sesión eliminando token y usuario del estado.
  function logout(): void {
    removeToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar auth en componentes.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}