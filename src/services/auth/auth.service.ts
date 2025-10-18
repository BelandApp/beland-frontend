import Constants from "expo-constants";
import { RegisterFormData } from "src/screens/Register/RegisterScreen";

// === CONFIGURACIÓN ===
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;
const scheme = Constants.expoConfig?.scheme as string;
const auth0Audience = Constants.expoConfig?.extra?.auth0Audience as string;
const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// Validar que las variables de entorno están disponibles
const configIsValid = auth0Domain && clientWebId && scheme && auth0Audience;

if (!configIsValid) {
  console.error(
    "❌ Las variables de entorno de Auth0 no están configuradas correctamente."
  );
}

export const authService = {
  async loginWithEmail(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (res.status !== 200) {
      throw new Error("Error en la solicitud de inicio de sesión");
    }
    const data = await res.json();
    return data.token;
  },

 
  async exchangeAuth0Token(auth0Token: string) {
    const res = await fetch(`${API_URL}/auth/exchange-auth0-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth0Token }),
    });
    if (!res.ok) throw new Error("Error intercambiando token Auth0");
    const data = await res.json();
    return data.token; // solo el token limpio
  },
  async getCurrentUser(token: string) {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status !== 200) {
      throw new Error("Error en la solicitud de obtener el usuario");
    }
    const data = await res.json();

    return data;
  },

  async changeRoleToCommerce() {
    const res = await fetch(`${API_URL}/users/changeRoleToCommerce`, {
      method: "PATCH",
    });
    if (res.status !== 200) {
      throw new Error("Error en la solicitud de obtener el usuario");
    }
    const data = await res.json();
    return data;
  },

  async registerUser(FormData: RegisterFormData) {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(FormData),
    });
    if (res.status !== 200) {
      throw new Error("Error en la solicitud de registro de usuario");
    }
    const data = await res.json();
    return data.token;
  },
};
