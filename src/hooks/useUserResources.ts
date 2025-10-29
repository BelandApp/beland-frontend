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

      // Use the correct endpoint for user resources
      const response = await ResourceService.getUserResources({
        limit: 50,
        page: 1,
      });

      console.log("User resources response:", response);

      // Handle response structure [items[], count] or direct items
      let resourceData: any[] = [];
      if (Array.isArray(response)) {
        if (response.length === 2 && Array.isArray(response[0])) {
          // Paginated response: [items[], total]
          resourceData = response[0];
        } else {
          // Direct array
          resourceData = response;
        }
      } else if (response && response.data) {
        // Standard paginated response with data property
        resourceData = response.data;
      }

      const availableResources: UserResource[] = resourceData
        .filter((userResource: any) => {
          if (!userResource.resource) return false;

          const isNotRedeemed = !userResource.is_redeemed;
          const hasQuantityLeft =
            userResource.quantity - userResource.quantity_redeemed > 0;
          const isNotExpired = userResource.resource.expires_at
            ? new Date(userResource.resource.expires_at) > new Date()
            : true;

          return isNotRedeemed && hasQuantityLeft && isNotExpired;
        })
        .map((userResource: any) => ({
          id: userResource.id,
          user_id: userResource.user_id || "",
          resource_id: userResource.resource.id,
          quantity: userResource.quantity,
          quantity_redeemed: userResource.quantity_redeemed,
          hash_id: userResource.hash_id || "",
          qr_code: userResource.qr_code,
          is_redeemed: userResource.is_redeemed,
          redeemed_at: userResource.redeemed_at
            ? new Date(userResource.redeemed_at)
            : null,
          expires_at: userResource.resource.expires_at
            ? new Date(userResource.resource.expires_at)
            : null,
          created_at: new Date(userResource.created_at),
          updated_at: new Date(
            userResource.updated_at || userResource.created_at
          ),
          resource: userResource.resource
            ? {
                id: userResource.resource.id,
                code: userResource.resource.code || "",
                name: userResource.resource.name,
                description: userResource.resource.description || "",
                url_image: userResource.resource.url_image,
                becoin_value: userResource.resource.becoin_value || 0,
                discount: userResource.resource.discount || 0,
                limit_user: userResource.resource.limit_user || 0,
                limit_app: userResource.resource.limit_app || 0,
                used_account: userResource.resource.used_account || 0,
                is_expired: userResource.resource.is_expired || false,
                expires_at: userResource.resource.expires_at
                  ? new Date(userResource.resource.expires_at)
                  : null,
                created_at: new Date(
                  userResource.resource.created_at || userResource.created_at
                ),
                resource_type_id: userResource.resource.resource_type_id || "",
                user_commerce_id: userResource.resource.user_commerce_id || "",
              }
            : null,
          user: userResource.user
            ? {
                id: userResource.user.id,
                full_name: userResource.user.full_name || "",
                email: userResource.user.email || "",
                profile_picture_url: userResource.user.profile_picture_url,
              }
            : null,
        }));

      setUserResources(availableResources);
    } catch (err: any) {
      console.error("Error fetching user resources:", err);
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
