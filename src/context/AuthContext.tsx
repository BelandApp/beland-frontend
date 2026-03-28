import React, { createContext, useContext, useEffect, useState } from "react";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  useAutoDiscovery,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { authService } from "src/services/auth/auth.service";
import { TokenService } from "src/services/auth/token.service";
import { Storage } from "src/services/auth/storage.service";
import { getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { clearStorage, resetStores } from "src/utils/logoutUtils";
import { Wallet } from "src/services/WalletApiService";

export type User = {
  id: string;
  address: string;
  city?: string;
  country?: string;
  created_at?: string;
  email: string;
  full_name: string;
  isBlocked: boolean;
  phone?: string;
  profile_picture_url?: string;
  profiles: string[];
  role_name?: string;
  total_weight_recycled: string;
};

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  LEADER = "LEADER",
  EMPRESA = "EMPRESA",
  USER = "USER",
}

const rolePermissions: Record<UserRole, string[]> = {
  SUPERADMIN: ["*"],
  ADMIN: ["manage_users", "view_dashboard"],
  LEADER: ["view_team"],
  EMPRESA: ["manage_company"],
  USER: ["basic_access"],
};

type StatusType = "checking" | "authenticated" | "unauthenticated" | "loading";
type AuthContextType = {
  user: User | null;
  token: string | null;
  status: StatusType;
  loginWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ token: string | null }>;
  handleAuth0Login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (partial: Partial<User>) => void;
  reloadUser: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean | typeof rolePermissions;
  getUserRole: () => UserRole | null;
  requireAuth: (action: () => void | Promise<void>) => Promise<void>; //TODO VER SI LO PODEMOS QUITAR
};
WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;
const clientNativeId = Constants.expoConfig?.extra
  ?.auth0MobileClientId as string;
const scheme = Constants.expoConfig?.scheme as string;
const auth0Audience = Constants.expoConfig?.extra?.auth0Audience as string;
const apiBaseUrl = Constants.expoConfig?.extra?.apiUrl as string;

// Validar que las variables de entorno están disponibles
const configIsValid = auth0Domain && clientWebId && scheme && auth0Audience;

if (!configIsValid) {
  console.error(
    "❌ Las variables de entorno de Auth0 no están configuradas correctamente.",
  );
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusType>("checking");
  useEffect(() => {
    (async () => {
      const savedToken = await TokenService.getToken();
      if (savedToken) {
        try {
          setStatus("loading");
          const me = await authService.getCurrentUser(savedToken);
          setToken(savedToken);
          setUser(me);
          setStatus("authenticated");
        } catch (e) {
          await TokenService.clearToken();
          setStatus("unauthenticated");
        }
      } else {
        setStatus("unauthenticated");
      }
    })();
  }, []);

  const redirectUrl = makeRedirectUri({
    path: Platform.select({ web: undefined, default: "callback" }),
    preferLocalhost: true,
  });
  // Development URL:
  // NATIVE> exp://localhost:8081/--/callback WEB> http://localhost:8081

  const discovery = useAutoDiscovery(`https://${auth0Domain}`);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Platform.OS === "web" ? clientWebId : clientNativeId,
      redirectUri: redirectUrl,
      scopes: ["openid", "profile", "email", "offline_access"],
      usePKCE: true,
      extraParams: {
        audience: auth0Audience,
        prompt: "login", // Fuerza a que Auth0 muestre la pantalla de login
      },
    },
    discovery,
  );

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (response && response.type === "success" && discovery) {
          const { code } = response.params;
          if (code) {
            const tokenResponse = await exchangeCodeAsync(
              {
                clientId: Platform.OS === "web" ? clientWebId : clientNativeId,
                code,
                redirectUri: redirectUrl,
                extraParams: {
                  code_verifier: request?.codeVerifier || "",
                },
              },
              discovery,
            );
            if (tokenResponse.accessToken) {
              setStatus("loading");

              await TokenService.saveToken(tokenResponse.accessToken);
              let me = await authService.exchangeAuth0Token(
                tokenResponse.accessToken,
              );
              await TokenService.saveToken(me.token);
              setToken(me.token);
              setUser(me.user);
              setStatus("authenticated");
            } else {
              throw new Error("accessToken no recibido.");
            }
          }
        }
      } catch (err) {
        await TokenService.clearToken();
        setUser(null);
        setToken(null);
        notify.error({ message: "Error al iniciar sesión." });
        setStatus("unauthenticated");
      }
    };

    handleRedirect();
  }, [response]);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setStatus("loading");
      const newToken = await authService.loginWithEmail(email, password);
      await TokenService.saveToken(newToken);
      setToken(newToken);
      const userData = await authService.getCurrentUser(newToken);
      setUser(userData);
      setStatus("authenticated");
      return { token: newToken };
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
      setStatus("unauthenticated");
      return { token: null };
    }
  };

  const handleAuth0Login = async () => {
    setStatus("loading");
    await promptAsync();
  };

  const logout = async () => {
    setStatus("loading");
    await clearStorage(Storage);
    resetStores();
    await TokenService.clearToken();
    setUser(null);
    setToken(null);
    setStatus("unauthenticated");
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...partial };
    });
  };
  const requireAuth = async (action: () => void | Promise<void>) => {
    if (!isAuthenticated && status === "unauthenticated") {
      notify.confirm({
        message: "Debes iniciar sesión para adquirir",
        onConfirm: () => handleAuth0Login(),
      });
    }

    await action();
  };
  const reloadUser = async () => {
    if (!token) {
      logout();
      return;
    }
    const newUser = await authService.getCurrentUser(token);
    setUser(newUser);
  };
  const isAuthenticated = !!user && !!token;
  const getUserRole = (): UserRole | null => {
    if (!user) return null;

    const rawRole = user.role_name;
    return rawRole?.toUpperCase() as UserRole;
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;

    const userRole = getUserRole();
    if (!userRole) return false;

    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }

    return userRole === roles;
  };

  const hasPermission = (permission: string) => {
    const role = getUserRole();
    if (!role) return false;

    const permissions = rolePermissions[role];

    return permissions.includes("*") || permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        loginWithEmail,
        handleAuth0Login,
        logout,
        isAuthenticated,
        requireAuth,
        updateUser,
        reloadUser,
        hasRole,
        getUserRole,
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
