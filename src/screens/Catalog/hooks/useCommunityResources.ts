import { useState, useEffect, useCallback } from "react";
import { ResourceService } from "@services/core";
import { useErrorHandler } from "@hooks/useErrorHandler";

interface CommunityResource {
  id: string;
  name: string;
  description: string;
  price: number;
  becoin_value: number;
  category: string;
  image_url?: string;
  [key: string]: any;
}

interface CommunityResourcesState {
  resources: CommunityResource[];
  loading: boolean;
  error: string | null;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

/**
 * Hook para manejar recursos de la comunidad en el catálogo
 */
export const useCommunityResources = () => {
  const [state, setState] = useState<CommunityResourcesState>({
    resources: [],
    loading: false,
    error: null,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const { handleError } = useErrorHandler();

  const fetchCommunityResources = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const resourceTypes = await ResourceService.getResourceTypes({
        active_only: true,
      });

      const resources =
        resourceTypes?.map((resourceType: any) => ({
          id: resourceType.id,
          name: resourceType.name,
          description: resourceType.description,
          price: resourceType.price_per_unit || 0,
          becoin_value: resourceType.becoin_value || 0,
          category: resourceType.category || "Sin categoría",
          image_url: resourceType.image_url,
          ...resourceType,
        })) || [];

      setState((prev) => ({
        ...prev,
        resources,
        loading: false,
        canScrollRight: resources.length > 3, // Asumiendo 3 items visibles
      }));
    } catch (error) {
      const processedError = handleError(error, {
        showNotification: false, // No mostrar notificación automática
        customMessage: "Error al cargar recursos de la comunidad",
      });

      setState((prev) => ({
        ...prev,
        loading: false,
        error: processedError?.message || "Error desconocido",
        resources: [],
      }));
    }
  }, [handleError]);

  const updateScrollState = useCallback(
    (canScrollLeft: boolean, canScrollRight: boolean) => {
      setState((prev) => ({
        ...prev,
        canScrollLeft,
        canScrollRight,
      }));
    },
    []
  );

  const retryFetch = useCallback(() => {
    fetchCommunityResources();
  }, [fetchCommunityResources]);

  useEffect(() => {
    fetchCommunityResources();
  }, [fetchCommunityResources]);

  return {
    ...state,
    refetch: fetchCommunityResources,
    retry: retryFetch,
    updateScrollState,
  };
};
