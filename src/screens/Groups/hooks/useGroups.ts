import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "@/services/GroupApiService";
import { GroupService } from "@/services";
import { mapApiGroupToUi } from "src/utils/groupMapper";

// Mapeo especial para grupos de usuario (cuando group_type es objeto)
function mapUserApiGroupToUi(api: any) {
  return {
    ...api,
    group_type:
      api.group_type?.name ||
      (typeof api.group_type === "string" ? api.group_type : null),
    privacy:
      api.privacy?.name ||
      (typeof api.privacy === "string" ? api.privacy : null),
    created_at: api.created_at ? new Date(api.created_at) : new Date(),
    updated_at: api.updated_at ? new Date(api.updated_at) : new Date(),
    deleted_at: api.deleted_at ? new Date(api.deleted_at) : null,
  };
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await GroupService.getMyGroups();
      // API may return paginated { groups, total } or data array
      let payload: any[] = [];
      if (Array.isArray(apiResponse)) {
        payload = apiResponse;
      } else if (apiResponse?.data) {
        payload = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      }

      // Detectar si los grupos vienen del endpoint de usuario (group_type es objeto)
      const mapped = (Array.isArray(payload) ? payload : []).map((g) =>
        typeof g.group_type === "object"
          ? mapUserApiGroupToUi(g)
          : mapApiGroupToUi(g),
      );

      setGroups(mapped);
    } catch (err: any) {
      setError(err.message || "Error al cargar los grupos desde la API.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  // Ya no se retorna getAllGroups como función, sino el array directamente
  const activeGroups = () => groups.filter((group) => group.is_active === true);

  const completedGroups = () =>
    groups.filter((group) => group.status === "completed");

  const filters = {
    Activos: (group: Group) =>
      group.status === "active" || group.status === "pending",
    Historial: (group: Group) => group.status === "completed",
  };

  const getGroupById = (id: string) => groups.find((group) => group.id === id);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };
  return {
    groups,
    getGroupById,
    activeGroups,
    completedGroups,
    refreshKey,
    loading,
    error,
    onRefresh,
    refreshing,
    filters,
  };
};
