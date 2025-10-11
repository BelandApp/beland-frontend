import { useState, useEffect } from "react";
import { ResourceService } from "@services/core";
import { UserResource } from "../types/resource";

export const useUserResources = () => {
  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserResources = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching user resources...");
      const response = await ResourceService.getRecyclingTransactions({
        limit: 50, // Límite alto para obtener todos los recursos disponibles
        page: 1, // Primera página
      });

      console.log("✅ User resources fetched:", response);

      // Filtrar solo los recursos no redimidos y no expirados
      const availableResources = (response.data || []).filter(
        (userResource: any) => {
          if (!userResource.resource) return false;

          const isNotRedeemed = !userResource.is_redeemed;
          const hasQuantityLeft =
            userResource.quantity - userResource.quantity_redeemed > 0;
          const isNotExpired = userResource.resource.expires_at
            ? new Date(userResource.resource.expires_at) > new Date()
            : true;

          return isNotRedeemed && hasQuantityLeft && isNotExpired;
        }
      );

      setUserResources(availableResources as any); // TODO: Map RecyclingTransaction to UserResource type
    } catch (err: any) {
      console.error("❌ Error fetching user resources:", err);
      setError("Error al obtener descuentos y promociones");
      setUserResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserResources();
  }, []);

  return {
    userResources,
    loading,
    error,
    refetch: fetchUserResources,
  };
};
