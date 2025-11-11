import Constants from "expo-constants";
import { RegisterFormData } from "src/screens/Register/RegisterScreen";
import { TokenService } from "./token.service";
import { FormCodeCheck, FormResetPassword } from "src/types";

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
    if (!res.ok) {
      throw new Error(res.statusText);
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
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const data = await res.json();
    return data.token; // solo el token limpio
  },
  async getCurrentUser(token: string) {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const data = await res.json();

    return data;
  },

  async changeRoleToCommerce() {
    const token = await TokenService.getToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const res = await fetch(`${API_URL}/users/changeRoleToCommerce`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const data = await res.json();
    return data;
  },

  async registerUser(FormData: RegisterFormData) {
    const res = await fetch(`${API_URL}/auth/signup-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(FormData),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const data = await res.json();
    return data.message;
  },
  async checkRegisterCode(FormData: { code: string; email: string }) {
    const res = await fetch(`${API_URL}/auth/signup-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(FormData),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const data = await res.json();
    return data.token;
  },
  async sendCodeToEmail(email: string) {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password-code/${email}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data.token;
    } catch (error) {
      alert(error);
    }
  },
  async checkCode(FormData: FormCodeCheck) {
    try {
      const res = await fetch(
        `${API_URL}/auth/forgot-password-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(FormData),
        }
      );
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data.token;
    } catch (error) {
      alert(error);
    }
  },
  async resetPassword(FormData: FormResetPassword) {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(FormData),
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data.token;
    } catch (error) {
      alert(error);
    }
  },
};
