import { useCallback } from "react";
import { useAuth } from "src/context/AuthContext";

export const useFetchWithAuth = () => {
  const { token } = useAuth();
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      };

      return fetch(url, { ...options, headers });
    },
    [token] // ✅ Dependencia correcta
  );

  return fetchWithAuth;
};
