/**
 * Hook para manejar las sugerencias de productos en grupo
 * Se conecta con el API real del backend
 */

import { useState, useEffect } from "react";
import { useAuth } from "src/context/AuthContext";
import { useNotify } from "src/hooks/notification/useNotify";
import { GroupService } from "src/services/groups/GroupApiService";
import type {
  GroupMemberConsumption,
  ConsumptionSummary,
} from "src/services/groups/GroupApiService";

export const useGroupMemberConsumptions = (groupId: string) => {
  const { user } = useAuth();
  const notify = useNotify();

  const [consumptions, setConsumptions] = useState<GroupMemberConsumption[]>(
    [],
  );
  const [allConsumptions, setAllConsumptions] = useState<
    GroupMemberConsumption[]
  >([]);
  const [summary, setSummary] = useState<ConsumptionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar las sugerencias al montar
  useEffect(() => {
    if (groupId && user?.id) {
      fetchConsumptions();
      fetchSummary();
    }
  }, [groupId, user?.id]);

  const fetchConsumptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GroupService.getUserConsumptions(groupId);
      setConsumptions(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar sugerencias";
      setError(errorMessage);
      console.error("Error fetching consumptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      // Backend no devuelve usuarios en el endpoint de summary, así que los calculamos manualmente
      // Obtenemos TODOS los consumos del grupo
      const allData = await GroupService.getGroupAllConsumptions(groupId);
      setAllConsumptions(allData);

      // Agrupamos por producto
      const grouped = allData.reduce(
        (acc, curr) => {
          const prodId = curr.product_id;
          if (!acc[prodId]) {
            acc[prodId] = {
              product_id: prodId,
              product_name: "", // Se llenará si el objeto curr trae el producto, o se infiere de otra forma
              total_consumers: 0,
              users: [],
              // Intenta obtener datos del producto de la respuesta si vienen populados
              product_image_url: null,
            } as any;
            // check relations if feasible
            if ((curr as any).product) {
              acc[prodId].product_name = (curr as any).product.name;
              acc[prodId].product_image_url = (curr as any).product.image_url;
            }
          }
          acc[prodId].total_consumers += 1;

          // Evitar duplicados en usuarios - usando el user_id del groupMember si está disponible
          // El backend devuelve groupMember con la relación
          const userId = (curr as any).groupMember?.user_id || curr.user_id;

          if (userId && !acc[prodId].users.includes(userId)) {
            acc[prodId].users.push(userId);
          }
          return acc;
        },
        {} as Record<string, ConsumptionSummary>,
      );

      setSummary(Object.values(grouped));
    } catch (err) {
      console.error("Error fetching summary (frontend aggregation):", err);
      // Fallback al endpoint original si falla
      try {
        const data = await GroupService.getSummaryConsumptions(groupId);
        setSummary(data);
      } catch (e) {
        console.error("Error fallback summary:", e);
      }
    }
  };

  /**
   * Sugerir un producto en el grupo
   */
  const suggestProduct = async (
    productId: string,
    notes?: string,
    userId?: string,
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        notify.error({ message: "Usuario no autenticado" });
        return false;
      }

      await GroupService.createConsumption(groupId, productId, notes, userId);

      // Recargar datos
      await fetchConsumptions();
      await fetchSummary();

      notify.success({ message: "Producto sugerido al grupo" });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al sugerir el producto";
      notify.error({ message: errorMessage });
      console.error("Error suggesting product:", err);
      return false;
    }
  };

  /**
   * Eliminar una sugerencia
   */
  const removeConsumption = async (consumptionId: string): Promise<boolean> => {
    try {
      await GroupService.deleteConsumption(consumptionId);

      // Recargar datos
      await fetchConsumptions();
      await fetchSummary();

      notify.success({ message: "Sugerencia eliminada" });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar sugerencia";
      notify.error({ message: errorMessage });
      console.error("Error removing consumption:", err);
      return false;
    }
  };

  return {
    consumptions,
    allConsumptions,
    summary,
    loading,
    error,
    suggestProduct,
    removeConsumption,
    refetch: fetchConsumptions,
  };
};
