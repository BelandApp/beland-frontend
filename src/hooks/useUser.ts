// FileName: /useUser .ts
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";

type ValidRoleNames =
  | "USER"
  | "LEADER"
  | "ADMIN"
  | "SUPERADMIN"
  | "COMMERCE"
  | "FUNDATION";

interface UpdateMeDto {
  full_name?: string;
  username?: string;
  profile_picture_url?: string | null;
  phone?: number;
  country?: string;
  city?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export const useAuthUser = () => {
  const { fetchWithAuth } = useAuth();
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET /users/me
  const getAuthenticatedUser = useCallback(async (): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${apiBaseUrl}/users/me`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error fetching authenticated user: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to fetch authenticated user.");
      Alert.alert(
        "Error",
        err.message || "Fallo al obtener perfil de usuario."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, apiBaseUrl]);

  // PATCH /users/me
  const updateAuthenticatedUser = useCallback(
    async (updateMeDto: UpdateMeDto): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateMeDto),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Error updating authenticated user: ${response.statusText}`
          );
        }
        const data = await response.json();
        Alert.alert("Éxito", "Perfil actualizado correctamente.");
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to update authenticated user.");
        Alert.alert("Error", err.message || "Fallo al actualizar perfil.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  // PATCH /users/changeRoleToCommerce
  const changeRoleToCommerce = useCallback(async (): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(
        `${apiBaseUrl}/users/changeRoleToCommerce`,
        {
          method: "PATCH",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error changing role to commerce: ${response.statusText}`
        );
      }
      const data = await response.json();
      Alert.alert("Éxito", "Rol cambiado a COMMERCE correctamente.");
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to change role to commerce.");
      Alert.alert("Error", err.message || "Fallo al cambiar rol a COMMERCE.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, apiBaseUrl]);

  // PATCH /users/change-role
  const changeRole = useCallback(
    async (roleName: ValidRoleNames): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(
          `${apiBaseUrl}/users/change-role?role_name=${roleName}`,
          {
            method: "PATCH",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Error changing role to ${roleName}: ${response.statusText}`
          );
        }
        const data = await response.json();
        Alert.alert("Éxito", `Rol cambiado a ${roleName} correctamente.`);
        return data;
      } catch (err: any) {
        setError(err.message || `Failed to change role to ${roleName}.`);
        Alert.alert(
          "Error",
          err.message || `Fallo al cambiar rol a ${roleName}.`
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  return {
    getAuthenticatedUser,
    updateAuthenticatedUser,
    changeRoleToCommerce,
    changeRole,
    loading,
    error,
  };
};
