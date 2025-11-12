import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "../../../types/Group";
import { GroupService } from "@services/core";

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
      const apiResponse = await GroupService.getGroups();
      setGroups((apiResponse.data as any) || []); // TODO: Fix type mapping between API and local Group types
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
    }, [])
  );

  const getAllGroups = () => groups;
  const activeGroups = () =>
    groups.filter(
      (group) => group.status === "active" || group.status === "pending"
    );

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
    getAllGroups,
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
