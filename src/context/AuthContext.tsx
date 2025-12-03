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
// Stores to reset on logout
import { useCartStore } from "src/stores/cart/useCartStore";
import { useBeCoinsStore } from "@/stores";
import { useOrdersStoreAPI } from "src/stores/useOrdersStoreAPI";
import { useCreateGroupStore } from "src/stores/useCreateGroupStore";
import { useAuthTokenStore } from "src/stores/useAuthTokenStore";
import { getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { clearStorage, resetStores } from "src/utils/logoutUtils";

export type User = {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  phone?: string;
  profile_picture_url?: string;
  country?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
  auth0_id?: string;
  role?: string;
  role_name?: string;
  coins?: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithEmail: (
    email: string,
    password: string
  ) => Promise<{ token: string | null }>;
  handleAuth0Login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  canPerformAction: boolean;
  setUser: (user: User | null) => void; //TODO VER SI LO PODEMOS QUITAR PARA MAYOR SEGURIDAD
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
    "❌ Las variables de entorno de Auth0 no están configuradas correctamente."
  );
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const savedToken = await TokenService.getToken();
      if (savedToken) {
        try {
          const me = await authService.getCurrentUser(savedToken);
          setToken(savedToken);
          setUser(me);
          // Sync with useAuthTokenStore
          useAuthTokenStore.getState().setToken(savedToken);
          useAuthTokenStore.getState().setUser(me);
        } catch (e) {
          await TokenService.clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const redirectUrl = makeRedirectUri({
    path: Platform.select({ web: undefined, default: "callback" }),
    preferLocalhost: true,
  });
  // Development URL:
  // NATIVE> exp://localhost:8081/--/callback WEB> http://localhost:8081
  console.log(auth0Audience)
  
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
    discovery
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
              discovery
            );
            if (tokenResponse.accessToken) {
              await TokenService.saveToken(tokenResponse.accessToken);
              let me = await authService.getCurrentUser(
                tokenResponse.accessToken
              );
              setToken(tokenResponse.accessToken);
              setUser(me);
              // Sync with useAuthTokenStore
              useAuthTokenStore.getState().setToken(tokenResponse.accessToken);
              useAuthTokenStore.getState().setUser(me);
            } else {
              throw new Error("accessToken no fue recibido.");
            }
          }
        }
      } catch (err) {
        await TokenService.clearToken();
        setUser(null);
        setToken(null);
        notify.error({ message: "Error al iniciar sesión." });
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [response]);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newToken = await authService.loginWithEmail(email, password);
      await TokenService.saveToken(newToken);
      setToken(newToken);
      const userData = await authService.getCurrentUser(newToken);
      setUser(userData);
      // Sync with useAuthTokenStore
      useAuthTokenStore.getState().setToken(newToken);
      useAuthTokenStore.getState().setUser(userData);
      return { token: newToken };
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
      return { token: null };
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth0Login = async () => {
    setIsLoading(true);
    await promptAsync();
  };

  const logout = async () => {
   await clearStorage(Storage);
   resetStores();

   await TokenService.clearToken();

   setUser(null);
   setToken(null);
  };
  const requireAuth = async (action: () => void | Promise<void>) => {
    if (!isAuthenticated) {
      notify.confirm({
        message: "Debes iniciar sesión para adquirir",
        onConfirm: () => handleAuth0Login(),
      });
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
        handleAuth0Login,
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
