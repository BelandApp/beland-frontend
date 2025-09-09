import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";

type ValidRoleNames = 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCE' | 'FUNDATION';

interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  includeDeleted?: boolean;
  id?: string;
  email?: string;
  roleName?: ValidRoleNames;
  isBlocked?: boolean;
  username?: string;
  full_name?: string;
  oauth_provider?: string;
  phone?: number;
  country?: string;
  city?: string;
}

export const useAdminUsers = () => {
  const { fetchWithAuth } = useAuth();
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllUsersAdmin = useCallback(
    async (params?: AdminUserQueryParams): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams(params as any).toString();
        const response = await fetchWithAuth(`${apiBaseUrl}/users?${query}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching users (admin): ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch users (admin).");
        Alert.alert("Error", err.message || "Fallo al obtener lista de usuarios.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const findUserByEmail = useCallback(
    async (email: string): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/by-email?email=${email}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error finding user by email: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to find user by email.");
        Alert.alert("Error", err.message || "Fallo al buscar usuario por email.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const getDeactivatedUsers = useCallback(
    async (): Promise<any[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/deactivated`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching deactivated users: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch deactivated users.");
        Alert.alert("Error", err.message || "Fallo al obtener usuarios desactivados.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const getUserByIdAdmin = useCallback(
    async (userId: string, includeDeleted: boolean = false): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const query = includeDeleted ? `?includeDeleted=${includeDeleted}` : '';
        const response = await fetchWithAuth(`${apiBaseUrl}/users/${userId}${query}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching user by ID (admin): ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch user by ID (admin).");
        Alert.alert("Error", err.message || "Fallo al obtener usuario por ID.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const updateUserByAdmin = useCallback(
    async (userId: string, updateUserDto: any): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateUserDto),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error updating user by admin: ${response.statusText}`);
        }
        const data = await response.json();
        Alert.alert("Éxito", "Usuario actualizado correctamente.");
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to update user by admin.");
        Alert.alert("Error", err.message || "Fallo al actualizar usuario.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const softDeleteUserByAdmin = useCallback(
    async (userId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error soft deleting user: ${response.statusText}`);
        }
        Alert.alert("Éxito", "Usuario desactivado correctamente.");
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to soft delete user.");
        Alert.alert("Error", err.message || "Fallo al desactivar usuario.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const reactivateUserByAdmin = useCallback(
    async (userId: string): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/${userId}/reactivate`, {
          method: "PATCH",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error reactivating user: ${response.statusText}`);
        }
        const data = await response.json();
        Alert.alert("Éxito", "Usuario reactivado correctamente.");
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to reactivate user.");
        Alert.alert("Error", err.message || "Fallo al reactivar usuario.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  const updateBlockStatus = useCallback(
    async (userId: string, blockUserDto: { isBlocked: boolean }): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/users/${userId}/block-status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(blockUserDto),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error updating block status: ${response.statusText}`);
        }
        const data = await response.json();
        Alert.alert("Éxito", `Estado de bloqueo actualizado a ${blockUserDto.isBlocked}.`);
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to update block status.");
        Alert.alert("Error", err.message || "Fallo al actualizar estado de bloqueo.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  return {
    getAllUsersAdmin,
    findUserByEmail,
    getDeactivatedUsers,
    getUserByIdAdmin,
    updateUserByAdmin,
    softDeleteUserByAdmin,
    reactivateUserByAdmin,
    updateBlockStatus,
    loading,
    error,
  };
};
