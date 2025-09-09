import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";

export const useUserResources = () => {
  const { fetchWithAuth } = useAuth();
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET /resources
  const getResources = useCallback(
    async (): Promise<any[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/resources`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching resources: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch resources.");
        Alert.alert("Error", err.message || "Fallo al obtener recursos.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  // GET /user-resources
  const getUserResources = useCallback(
    async (params?: Record<string, any>): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const query = params ? new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)])
        ).toString() : "";
        const response = await fetchWithAuth(`${apiBaseUrl}/user-resources${query ? `?${query}` : ""}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching user resources: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch user resources.");
        Alert.alert("Error", err.message || "Fallo al obtener recursos de usuario.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  // GET /user-resources/total-available/:resource_id
  const getTotalAvailableResource = useCallback(
    async (resourceId: string): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/user-resources/total-available/${resourceId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching total available resource: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch total available resource.");
        Alert.alert("Error", err.message || "Fallo al obtener total disponible del recurso.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  // GET /user-resources/remaining/:hash_id
  const getRemainingResourceByHash = useCallback(
    async (hashId: string): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/user-resources/remaining/${hashId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error fetching remaining resource by hash: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to fetch remaining resource by hash.");
        Alert.alert("Error", err.message || "Fallo al obtener recurso restante por hash.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  // POST /user-resources
  const createUserResource = useCallback(
    async (body: { resource_id: string; quantity: number }): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/user-resources`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error creating user resource: ${response.statusText}`);
        }
        const data = await response.json();
        Alert.alert("Éxito", "Recurso creado correctamente.");
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to create user resource.");
        Alert.alert("Error", err.message || "Fallo al crear recurso.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  // PUT /user-resources/redeem/:hash_id
  const redeemUserResource = useCallback(
    async (hashId: string, quantity: number): Promise<any | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${apiBaseUrl}/user-resources/redeem/${hashId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity_redeemed: quantity }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error redeeming user resource: ${response.statusText}`);
        }
        const data = await response.json();
        Alert.alert("Éxito", data.message || "Recurso redimido correctamente.");
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to redeem user resource.");
        Alert.alert("Error", err.message || "Fallo al redimir recurso.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, apiBaseUrl]
  );

  return {
    getResources,
    getUserResources,
    getTotalAvailableResource,
    getRemainingResourceByHash,
    createUserResource,
    redeemUserResource,
    loading,
    error,
  };
};
