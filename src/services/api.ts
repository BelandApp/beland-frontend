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

    console.log(
      `📡 Response Status: ${response.status} ${response.statusText}`
    );

    let data;
    try {
      data = await response.json();
      // console.log(`📦 Response Data:`, data);
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
