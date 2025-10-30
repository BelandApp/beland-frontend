import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  useAutoDiscovery,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import { authService } from "src/services/auth/auth.service";
import { TokenService } from "src/services/auth/token.service";
import { Storage } from "src/services/auth/storage.service";
// Stores to reset on logout
import { useCartStore } from "src/stores/useCartStore";
import { useBeCoinsStore } from "src/stores/useBeCoinsStore";
import { useOrdersStoreAPI } from "src/stores/useOrdersStoreAPI";
import { useCreateGroupStore } from "src/stores/useCreateGroupStore";
import { useAuthTokenStore } from "src/stores/useAuthTokenStore";

export type User = {
  id: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
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
        } catch (e) {
          await TokenService.clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const discovery = useAutoDiscovery(`https://${auth0Domain}`);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Platform.OS === "web" ? clientWebId : clientNativeId,
      redirectUri: makeRedirectUri({
        scheme: scheme,
        path: Platform.select({ web: undefined, default: "callback" }),
        preferLocalhost: true,
      }),
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
                clientId: clientWebId,
                code,
                redirectUri: makeRedirectUri({
                  scheme: scheme,
                  path: Platform.select({
                    web: undefined,
                    default: "callback",
                  }),
                }),
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
            } else {
              throw new Error("accessToken no fue recibido.");
            }
          }
        }
      } catch (err) {
        await TokenService.clearToken();
        setUser(null);
        setToken(null);
        Alert.alert(
          "Error de autenticación",
          "Fallo al iniciar sesión. Por favor, inténtelo de nuevo."
        );
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
      setUser(await authService.getCurrentUser(newToken));
    } catch (error) {
      Alert.alert(
        "Error de autenticación",
        "Fallo al iniciar sesión. Por favor, inténtelo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth0Login = async () => {
    setIsLoading(true);
    await promptAsync();
  };

  const logout = async () => {
    // Clear auth token and secure/local storage entries
    await TokenService.clearToken();

    // Keys we want to ensure are removed on logout (localStorage / SecureStore / AsyncStorage)
    const keysToClear = [
      // auth tokens and user
      "access_token",
      "auth_token",
      "auth_user",

      // app stores persisted to storage
      "cart-store",
      "orders-store-api",
      "becoins-store",
      "create-group-store",
      "groups-storage",

      // payment / wallet / payphone
      "payphone_token",
      "wallet_id",
      "payphone_is_qr_payment",
      "payphone_to_wallet_id",
      "wallet_id",
    ];

    try {
      await Promise.all(keysToClear.map((k) => Storage.removeItem(k)));
    } catch (e) {
      // best-effort: also try to remove from window.localStorage if available
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          keysToClear.forEach((k) => window.localStorage.removeItem(k));
        } catch (err) {
          console.warn("Error clearing localStorage keys on logout:", err);
        }
      }
    }

    // Reset in-memory stores to initial state so UI doesn't show stale data
    try {
      useCartStore.getState().clearCart && useCartStore.getState().clearCart();
    } catch (e) {}

    try {
      useBeCoinsStore.getState().resetBalance &&
        useBeCoinsStore.getState().resetBalance();
    } catch (e) {}

    try {
      useOrdersStoreAPI.getState().clearOrders &&
        useOrdersStoreAPI.getState().clearOrders();
    } catch (e) {}

    try {
      useCreateGroupStore.getState().clearGroup &&
        useCreateGroupStore.getState().clearGroup();
    } catch (e) {}

    try {
      useAuthTokenStore.getState().clearToken &&
        useAuthTokenStore.getState().clearToken();
      useAuthTokenStore.getState().clearUser &&
        useAuthTokenStore.getState().clearUser();
    } catch (e) {}

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
          { text: "Iniciar sesión", onPress: handleAuth0Login },
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
