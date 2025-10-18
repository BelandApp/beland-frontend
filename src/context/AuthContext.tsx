import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { useAuth0Login } from "src/hooks/authSession/useAuthLogin0";
import { authService } from "src/services/auth/auth.service";
import { TokenService } from "src/services/auth/token.service";

export type User = {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  auth0_id?: string;
  role?: string;
  role_name?: string;
  coins?: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithAuth0: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  canPerformAction: boolean;
  setUser: (user: User | null) => void; //TODO VER SI LO PODEMOS QUITAR PARA MAYOR SEGURIDAD
  requireAuth: (action: () => void | Promise<void>) => Promise<void>; //TODO VER SI LO PODEMOS QUITAR
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loginWithAuth0 } = useAuth0Login();
  useEffect(() => {
    (async () => {
      const savedToken = await TokenService.getToken();
      if (savedToken) {
        try {
          const me = await authService.getCurrentUser(savedToken);
          setToken(savedToken);
          setUser(me);
        } catch (e) {
          await TokenService.clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const newToken = await authService.loginWithEmail(email, password);
    await TokenService.saveToken(newToken);
    setToken(newToken);
    setUser(await authService.getCurrentUser(newToken));
  };

  const handleAuth0Login = async () => {
    try {
      const token = await loginWithAuth0();
      await TokenService.saveToken(token);
      setToken(token);
      setUser(await authService.getCurrentUser(token));
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await TokenService.clearToken();
    setUser(null);
    setToken(null);
  };
  const requireAuth = async (action: () => void | Promise<void>) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Inicio de sesión requerido",
        "Debes iniciar sesión para realizar esta acción.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar sesión", onPress: loginWithAuth0 },
        ]
      );
      return;
    }

    await action();
  };

  const isAuthenticated = !!user && !!token;
  const canPerformAction = isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginWithEmail,
        loginWithAuth0,
        logout,
        isAuthenticated,
        canPerformAction,
        requireAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
