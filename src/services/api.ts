import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuración base para los servicios de API
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://[::1]:3001/api";

// Configuración de headers por defecto
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Función auxiliar para obtener el token desde localStorage (web) o AsyncStorage (móvil)
async function getAuthToken() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem("auth_token");
  } else {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch {
      return null;
    }
  }
}

// Función auxiliar para hacer requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Obtener token de localStorage o AsyncStorage
  const token = await getAuthToken();
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);
    const response = await fetch(url, config);

    console.log(
      `📡 Response Status: ${response.status} ${response.statusText}`
    );

    let data;
    try {
      data = await response.json();
      console.log(`📦 Response Data:`, data);
    } catch (jsonError) {
      console.log(`⚠️ No JSON response or empty body`);
      data = null;
    }

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, data);
      const err: any = new Error(
        (data && (data.error || data.message)) ||
          `HTTP error! status: ${response.status}`
      );
      err.status = response.status;
      err.body = data;
      throw err;
    }

    // Si el backend responde 200 pero con null, esto podría indicar un problema
    if (data === null && response.status === 200) {
      console.warn(
        `⚠️ Backend returned null for successful request to ${endpoint}`
      );
    }

    return data;
  } catch (error) {
    console.error(`🚨 API Request failed:`, error);
    throw error;
  }
};

export { apiRequest, API_BASE_URL };
