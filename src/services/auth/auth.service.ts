import Constants from "expo-constants";
import { RegisterFormData } from "src/screens/Register/RegisterScreen";
import { TokenService } from "./token.service";
import { FormCodeCheck, FormResetPassword } from "src/types";
import { CoreApiService } from "@/services/core/ApiService";

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

const _core = new CoreApiService();

export const authService = {
  async loginWithEmail(email: string, password: string) {
    const data = await _core.post(
      `/auth/login`,
      { email, password },
      { skipAuth: true }
    );
    return data.token;
  },

  async exchangeAuth0Token(auth0Token: string) {
    const data = await _core.post(
      `/auth/exchange-auth0-token`,
      { auth0Token },
      { skipAuth: true }
    );
    return data.token;
  },

  async getCurrentUser(token: string) {
    // Use CoreApiService but pass explicit Authorization header
    const data = await _core.get(`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      skipAuth: true,
    });
    return data;
  },

  async changeRoleToCommerce() {
    const token = await TokenService.getToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const data = await _core.patch(`/users/changeRoleToCommerce`, undefined, {
      headers: { Authorization: `Bearer ${token}` },
      skipAuth: true,
    });
    return data;
  },

  async registerUser(FormData: RegisterFormData) {
    const data = await _core.post(`/auth/signup-verification`, FormData, {
      skipAuth: true,
    });
    return data.message;
  },
  async resendRegisterCode(email: string) {
    const data = await _core.post(`/auth/resend-code`, email, {
      skipAuth: true,
    });
    return data.message;
  },
  async checkRegisterCode(FormData: { code: string; email: string }) {
    const data = await _core.post(`/auth/signup-register`, FormData, {
      skipAuth: true,
    });
    return data.token;
  },
  async sendCodeToEmailForgotPassword(email: string) {
    try {
      const data = await _core.post(
        `/auth/forgot-password-code/${email}`,
        undefined,
        { skipAuth: true }
      );
      return data.message;
    } catch (err: any) {
      if (err?.status === 404) return "El correo no se encuentra registrado";
      throw err;
    }
  },
  async checkCode(FormData: FormCodeCheck) {
    const data = await _core.post(
      `/auth/forgot-password-verification-code`,
      FormData,
      { skipAuth: true }
    );
    return data.message;
  },
  async resetPassword(FormData: FormResetPassword) {
    const data = await _core.post(`/auth/reset-password`, FormData, {
      skipAuth: true,
    });
    return data.token;
  },
};
