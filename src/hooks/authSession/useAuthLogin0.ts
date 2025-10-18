import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { authService } from "src/services/auth/auth.service";

export const useAuth0Login = () => {
  const clientId =
    Platform.OS === "web"
      ? Constants.expoConfig?.extra?.auth0WebClientId
      : Constants.expoConfig?.extra?.auth0MobileClientId;

  const discovery = AuthSession.useAutoDiscovery(
    `https://${Constants.expoConfig?.extra?.auth0Domain}`
  );

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri: AuthSession.makeRedirectUri({
        preferLocalhost: Platform.OS === "web" ? false : true,
        scheme:
          Platform.OS === "web" ? undefined : Constants.expoConfig?.scheme as string,
        path: Platform.OS === "web" ? undefined : "callback",
      }),
      scopes: ["openid", "profile", "email", "offline_access"],
      usePKCE: true,
      extraParams: {
        audience: Constants.expoConfig?.extra?.auth0Audience,
        prompt: "login",
      },
    },
    discovery
  );

  const loginWithAuth0 = async () => {
    const result = await promptAsync();

    if (result.type === "success" && result.params.access_token) {
      const auth0Token = result.params.access_token;
      // Intercambiar token con backend usando el service
      const newToken = await authService.exchangeAuth0Token(auth0Token);
      return newToken;
    }

    throw new Error("Error en Auth0 login");
  };

  return { request, response, loginWithAuth0 };
};
