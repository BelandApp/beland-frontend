import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokenService } from "./auth";

// Configuración base para los servicios de API
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://[::1]:3001/api";

// Configuración de headers por defecto
const defaultHeaders = {
  "Content-Type": "application/json",
};

const getBackendErrorMessage = (err: any): string => {
  return (
    err?.body?.message ||
    err?.message ||
    "Ocurrió un error inesperado. Intenta de nuevo."
  );
};

// Función auxiliar para hacer requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Si se pasa una URL absoluta, usarla tal cual
  let url: string;
  if (/^https?:\/\//i.test(endpoint)) {
    url = endpoint;
  } else {
    // Normalizar base y endpoint para evitar concatenaciones como '/apiproducts'
    const base = String(API_BASE_URL).replace(/\/+$/g, "");
    const path = String(endpoint).replace(/^\/+/, "");
    url = `${base}/${path}`;
  }

  // Obtener token de localStorage o AsyncStorage
  const token = await TokenService.getToken();
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
    const response = await fetch(url, config);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      data = null;
    }

    if (!response.ok) {
      const err: any = new Error(
        (data && (data.error || data.message)) ||
          `HTTP error! status: ${response.status}`
      );
      err.status = response.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export { apiRequest, API_BASE_URL, getBackendErrorMessage };
