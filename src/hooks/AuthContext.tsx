import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform, Alert, View, Text, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  useAutoDiscovery,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useAuthTokenStore } from "src/stores/useAuthTokenStore";

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

// === PROVEEDOR ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthTokenStore(state => state.user);
  const setUser = useAuthTokenStore(state => state.setUser);
  const clearUser = useAuthTokenStore(state => state.clearUser);
  const [isLoading, setIsLoading] = useState(true);

  if (!configIsValid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error de configuración: Falta alguna variable de entorno de Auth0.
        </Text>
      </View>
    );
  }

  const discovery = useAutoDiscovery(`https://${auth0Domain}`);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientWebId,
      redirectUri: makeRedirectUri({
        scheme: scheme,
        path: Platform.select({ web: undefined, default: "callback" }),
      }),
      scopes: ["openid", "profile", "email", "offline_access"],
      usePKCE: true,
      extraParams: {
        audience: auth0Audience,
        prompt: "login",
      },
    },
    discovery
  );

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken();
      if (!token) throw new Error("No hay token de autenticación.");

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, { ...options, headers });
    },
    []
  );

  const getProfile = useCallback(async () => {
    const response = await fetchWithAuth(`${apiBaseUrl}/auth/me`);
    if (!response.ok) throw new Error(`Error al obtener perfil`);
    const data = await response.json();
    setUser({ ...data, picture: data.profile_picture_url });
  }, [apiBaseUrl, fetchWithAuth]);

  // Se ha consolidado toda la lógica de inicialización en un solo useEffect.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Restaurar sesión híbrida solo una vez al montar
        const token = await getToken();
        if (token) {
          // Si hay token, intenta obtener el perfil para validar la sesión
          try {
            await getProfile();
            setIsLoading(false);
            return; // Sesión restaurada, no hay más que hacer.
          } catch (error) {
            console.error("❌ Token inválido, limpiando sesión.", error);
            clearUser();
            await deleteToken();
          }
        }

        // Procesar la respuesta de autenticación solo si existe
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
              await saveToken(tokenResponse.accessToken);
              await getProfile();
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
  }, [response, discovery, getProfile, request]);

  // Esta función ahora usa el promptAsync original que maneja el pop-up,
  // y lo deja como la forma recomendada por Expo.
  const loginWithAuth0 = () => {
    setIsLoading(true);
    promptAsync();
  };

  const logout = async () => {
    clearUser();
    await deleteToken();
    if (Platform.OS === "web") {
      localStorage.clear();
    } else {
      await AsyncStorage.clear();
    }
  };

  const isAuthenticated = !!user;
  const canPerformAction = isAuthenticated;

  const requireAuth = async (action: () => void | Promise<void>) => {
    if (!isAuthenticated) {
      Alert.alert("Inicio requerido", "Debes iniciar sesión para continuar.");
      throw new Error("Usuario no autenticado");
    }
    await action();
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
      }}>
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
