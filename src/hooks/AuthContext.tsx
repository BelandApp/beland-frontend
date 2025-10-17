import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform, Alert, View, Text, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  useAutoDiscovery,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { SocketService, RespSocket } from "../services/SocketService";
import { useAuthTokenStore } from "src/stores/useAuthTokenStore";
import {
  useBeCoinsStore,
  useBeCoinsStoreHydration,
} from "src/stores/useBeCoinsStore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;
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

// === TIPADO ===
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  auth0_id?: string;
  role?: string;
  role_name?: string;
  coins?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  isLoading: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  // Nuevos helpers para manejar autenticación
  isAuthenticated: boolean;
  requireAuth: (action: () => void | Promise<void>) => Promise<void>;
  canPerformAction: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === Almacenamiento híbrido de token y usuario ===
const saveToken = async (token: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem("auth_token", token);
  } else {
    await AsyncStorage.setItem("auth_token", token);
  }
};

const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("auth_token");
  } else {
    return await AsyncStorage.getItem("auth_token");
  }
};

const deleteToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("auth_token");
  } else {
    await AsyncStorage.removeItem("auth_token");
  }
};

// Función para limpiar todos los datos del localStorage al hacer logout
const clearAllLocalStorage = async () => {
  try {
    if (Platform.OS === "web") {
      // Limpiar datos específicos de la aplicación
      const keysToRemove = [
        "auth_token",
        "auth_user",
        "cart-store",
        "becoins-store",
        "orders-store-api",
        "group-store",
        "orders-store",
        "create-group-store",
        "wallet_id",
        // Agregar cualquier otra clave que la app use en localStorage
      ];

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      console.log("🧹 LocalStorage limpiado en web");
    } else {
      // Para mobile, limpiar AsyncStorage
      const keysToRemove = [
        "auth_token",
        "auth_user",
        "cart-store",
        "becoins-store",
        "orders-store-api",
        "group-store",
        "orders-store",
        "create-group-store",
      ];

      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.warn(`Error eliminando ${key} de AsyncStorage:`, error);
        }
      }

      console.log("🧹 AsyncStorage limpiado en mobile");
    }
  } catch (error) {
    console.error("❌ Error limpiando almacenamiento local:", error);
  }
};

// === PROVEEDOR ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // --- Socket.io integration (puedes re-agregarlo luego si lo necesitas) ---
  // const socketService = React.useRef<SocketService | null>(null);
  // const [socketData, setSocketData] = useState<RespSocket | null>(null);

  const user = useAuthTokenStore((state) => state.user);
  const setUserRaw = useAuthTokenStore((state) => state.setUser);
  const clearUser = useAuthTokenStore((state) => state.clearUser);
  const setBeCoinsBalance = useBeCoinsStore((s) => s.setBalance);

  // Wrapper para logging cuando se actualiza el usuario (ayuda a depuración)
  const setUser = (u: AuthUser | null) => {
    try {
      // setUser wrapper
    } catch (e) {
      // ignore
    }
    setUserRaw(u);

    try {
      // Actualizar store de BeCoins cuando cambiamos el user
      if (!u) {
        setBeCoinsBalance(0);
      } else {
        const becoins =
          Number((u as any).current_balance ?? (u as any).coins ?? 0) || 0;
        setBeCoinsBalance(becoins);
      }
    } catch (e) {
      console.warn("[AuthContext] no se pudo actualizar becoins store:", e);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  // Hidratar el store de BeCoins desde almacenamiento persistido
  const becoinsHydrated = useBeCoinsStoreHydration();

  // useEffect para socket y balance eliminado

  if (!configIsValid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error de configuración: Falta alguna variable de entorno de Auth0. Por
          favor, revisa tus archivos .env y app.config.js.
        </Text>
      </View>
    );
  }

  const clientId =
    Platform.OS === "web"
      ? clientWebId
      : (Constants.expoConfig?.extra?.auth0MobileClientId as string);
 
  const discovery = useAutoDiscovery(`https://${auth0Domain}`);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId,
      redirectUri: makeRedirectUri({
        scheme: Platform.OS === "web" ? undefined : scheme,
        path: Platform.OS === "web" ? undefined : "callback",
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

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No hay token de autenticación.");
      }

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    },
    []
  );

  const getProfile = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${apiBaseUrl}/auth/me`);
      if (!response.ok) {
        throw new Error(`Error al obtener perfil: ${response.statusText}`);
      }
      const data = await response.json();
      // /auth/me response received

      // Normalizar role: backend puede devolver `role` (string u objeto) o `role_name`.
      let rawRoleVal = "";
      if (typeof data.role === "string") {
        rawRoleVal = data.role;
      } else if (data.role && typeof data.role === "object") {
        rawRoleVal = data.role.name || data.role.role_name || "";
      } else {
        rawRoleVal = data.role_name || "";
      }
      const normalizedRole = rawRoleVal
        ? rawRoleVal.toString().toUpperCase()
        : undefined;

      const userObj = {
        ...data,
        role: normalizedRole,
        picture: data.profile_picture_url || data.picture,
      } as any;
      setUser(userObj);

      // Intentar sincronizar el saldo real de la wallet del usuario
      try {
        const walletRes = await fetchWithAuth(`${apiBaseUrl}/wallets/user`);
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          // /wallets/user response received
          const becoinVal =
            Number(
              walletData?.becoin_balance ??
                walletData?.be_coin_balance ??
                walletData?.balance ??
                walletData?.current_balance ??
                0
            ) || 0;
          try {
            setBeCoinsBalance(becoinVal);
          } catch (e) {
            console.warn(
              "[AuthContext] no se pudo setear becoins desde wallet:",
              e
            );
          }
        } else {
          // could not fetch wallet
        }
      } catch (err) {
        // error consulting /wallets/user
      }
      // Perfil de usuario obtenido exitosamente
    } catch (error) {
      // error getting user profile
      clearUser();
      await deleteToken();
      throw error;
    }
  }, [apiBaseUrl, fetchWithAuth]);

  // Se ha consolidado toda la lógica de inicialización en un solo useEffect.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Restaurar sesión híbrida solo una vez al montar
        const token = await getToken();
        if (!token) {
          clearUser();
        } else {
          // Si hay token, primero sincronizamos cualquier user cacheado para
          // disparar side-effects (como actualizar becoins), y luego
          // refrescamos el perfil desde el backend para obtener datos reales.
          try {
            if (user) {
              setUser(user);
            }
          } catch (e) {
            console.warn("[AuthContext] no se pudo setear user cacheado:", e);
          }

          // Refrescar perfil real del backend
          await getProfile();
        }

        // Procesar redireccionamiento de Auth0 solo si hay response
        if (response && response.type === "success" && discovery) {
          const { code } = response.params;
          if (code) {
            const tokenResponse = await exchangeCodeAsync(
              {
                clientId: clientId,
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
              await saveToken(tokenResponse.accessToken);
              await getProfile();
            } else {
              throw new Error("accessToken no fue recibido.");
            }
          }
        }
      } catch (err) {
        clearUser();
        await deleteToken();
        Alert.alert(
          "Error de autenticación",
          "Fallo al iniciar sesión. Por favor, inténtelo de nuevo."
        );
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const loginWithAuth0 = async () => {
    // Es importante establecer isLoading en true antes de iniciar el flujo
    // para que la interfaz de usuario muestre el estado de carga.
    setIsLoading(true);
    await promptAsync();
  };

  const logout = async () => {
    try {
      // Limpiar estado de autenticación
      clearUser();
      await deleteToken();

      // Limpiar todos los datos del localStorage
      await clearAllLocalStorage();
      // Asegurar que el balance local de becoins se resetee
      try {
        setBeCoinsBalance(0);
      } catch (e) {
        console.warn("[AuthContext] no se pudo resetear becoins en logout:", e);
      }

      // Logout completed
    } catch (error) {
      // error during logout
    }
  };

  // === NUEVAS FUNCIONES PARA MANEJAR AUTENTICACIÓN ===

  // Determinar si el usuario está autenticado
  const isAuthenticated = !!user && !!getToken();

  // Helper para determinar si se puede realizar una acción
  const canPerformAction = isAuthenticated;

  // Función helper para proteger acciones que requieren autenticación
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
      throw new Error("Usuario no autenticado");
    }

    try {
      await action();
    } catch (error) {
      console.error("Error en acción protegida:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        clearUser,
        isLoading,
        loginWithAuth0,
        logout,
        fetchWithAuth,
        isAuthenticated,
        requireAuth,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
