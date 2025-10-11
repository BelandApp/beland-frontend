import { useState, useEffect, useCallback } from "react";
import { ResourceService } from "@services/core";
import { UserResource } from "../types/resource";

export const useUserResources = () => {
  const [userResources, setUserResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ResourceService.getRecyclingTransactions({
        limit: 50,
        page: 1,
      });

      const availableResources: UserResource[] = (response.data || [])
        .filter((transaction: any) => {
          if (!transaction.resource) return false;

          const isNotRedeemed = !transaction.is_redeemed;
          const hasQuantityLeft =
            transaction.quantity - transaction.quantity_redeemed > 0;
          const isNotExpired = transaction.resource.expires_at
            ? new Date(transaction.resource.expires_at) > new Date()
            : true;

          return isNotRedeemed && hasQuantityLeft && isNotExpired;
        })
        .map((transaction: any) => ({
          id: transaction.id,
          user_id: transaction.user_id || "",
          resource_id: transaction.resource.id,
          quantity: transaction.quantity,
          quantity_redeemed: transaction.quantity_redeemed,
          hash_id: transaction.hash_id || "",
          qr_code: transaction.qr_code,
          is_redeemed: transaction.is_redeemed,
          redeemed_at: transaction.redeemed_at
            ? new Date(transaction.redeemed_at)
            : null,
          expires_at: transaction.resource.expires_at
            ? new Date(transaction.resource.expires_at)
            : null,
          created_at: new Date(transaction.created_at),
          updated_at: new Date(
            transaction.updated_at || transaction.created_at
          ),
          resource: transaction.resource
            ? {
                id: transaction.resource.id,
                code: transaction.resource.code || "",
                name: transaction.resource.name,
                description: transaction.resource.description || "",
                url_image: transaction.resource.url_image,
                becoin_value: transaction.resource.becoin_value || 0,
                discount: transaction.resource.discount || 0,
                limit_user: transaction.resource.limit_user || 0,
                limit_app: transaction.resource.limit_app || 0,
                used_account: transaction.resource.used_account || 0,
                is_expired: transaction.resource.is_expired || false,
                expires_at: transaction.resource.expires_at
                  ? new Date(transaction.resource.expires_at)
                  : null,
                created_at: new Date(
                  transaction.resource.created_at || transaction.created_at
                ),
                resource_type_id: transaction.resource.resource_type_id || "",
                user_commerce_id: transaction.resource.user_commerce_id || "",
              }
            : null,
          user: transaction.user
            ? {
                id: transaction.user.id,
                full_name: transaction.user.full_name || "",
                email: transaction.user.email || "",
                profile_picture_url: transaction.user.profile_picture_url,
              }
            : null,
        }));

      setUserResources(availableResources);
    } catch (err: any) {
      setError("Error al obtener descuentos y promociones");
      setUserResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserResources();
  }, [fetchUserResources]);

  const getResourcesByType = useCallback(
    (resourceTypeId: string) => {
      return userResources.filter(
        (userResource) =>
          userResource.resource?.resource_type_id === resourceTypeId
      );
    },
    [userResources]
  );

  // Obtener total de BeCoins disponibles
  const getTotalBeCoinsValue = useCallback(() => {
    return userResources.reduce((total, userResource) => {
      const availableQuantity =
        userResource.quantity - userResource.quantity_redeemed;
      const unitValue = userResource.resource?.becoin_value || 0;
      return total + availableQuantity * unitValue;
    }, 0);
  }, [userResources]);

  // Obtener recursos que expiran pronto (próximos 7 días)
  const getExpiringResources = useCallback(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return userResources.filter(
      (userResource) =>
        userResource.expires_at && userResource.expires_at <= nextWeek
    );
  }, [userResources]);

  // Obtener recurso por ID
  const getResourceById = useCallback(
    (resourceId: string) => {
      return userResources.find(
        (userResource) => userResource.id === resourceId
      );
    },
    [userResources]
  );

  // Obtener recursos activos (no redimidos completamente)
  const getActiveResources = useCallback(() => {
    return userResources.filter(
      (userResource) =>
        !userResource.is_redeemed &&
        userResource.quantity > userResource.quantity_redeemed
    );
  }, [userResources]);

  // Obtener recursos por nombre
  const getResourcesByName = useCallback(
    (searchTerm: string) => {
      return userResources.filter((userResource) =>
        userResource.resource?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    },
    [userResources]
  );

  return {
    userResources,
    loading,
    error,
    refetch: fetchUserResources,
    getResourcesByType,
    getTotalBeCoinsValue,
    getExpiringResources,
    getResourceById,
    getActiveResources,
    getResourcesByName,
  };
};
