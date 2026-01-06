/**
 * Hook para manejar las sugerencias de productos en grupo
 * Se conecta con el API real del backend
 */

import { useState, useEffect } from "react";
import { useAuth } from "src/context/AuthContext";
import { useNotify } from "src/hooks/notification/useNotify";
import { GroupService } from "src/services/GroupApiService";
import type {
  GroupMemberConsumption,
  ConsumptionSummary,
} from "src/services/GroupApiService";

export const useGroupMemberConsumptions = (groupId: string) => {
  const { user } = useAuth();
  const notify = useNotify();

  const [consumptions, setConsumptions] = useState<GroupMemberConsumption[]>(
    []
  );
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
      const data = await GroupService.getSummaryConsumptions(groupId);
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  /**
   * Sugerir un producto en el grupo
   */
  const suggestProduct = async (
    productId: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        notify.error({ message: "Usuario no autenticado" });
        return false;
      }

      await GroupService.createConsumption(groupId, productId, notes);

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
    summary,
    loading,
    error,
    suggestProduct,
    removeConsumption,
    refetch: fetchConsumptions,
  };
};
