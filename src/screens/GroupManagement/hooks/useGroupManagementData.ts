import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Group } from "../../../types/Group";
import { useGroups } from "../../Groups/hooks/useGroups";
import { useAuth } from "@/context/AuthContext";

export const useGroupManagementData = (groupId: string, navigation: any) => {
  const { getGroupById, refreshKey } = useGroups();
  const { user } = useAuth();
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // Determinar si el usuario actual es el administrador del grupo
  // Usar el ID del usuario autenticado del contexto y comparar con leader_id
  const isGroupAdmin = currentGroup?.leader_id === user?.id;

  useEffect(() => {
    const group = getGroupById(groupId);
    if (group) {
      setCurrentGroup(group);
    } else {
      Alert.alert("Error", "Grupo no encontrado", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }, [groupId, getGroupById, navigation, refreshKey]);

  const handleGroupUpdated = (updatedGroup: Group) => {
    setCurrentGroup(updatedGroup);
    // También actualizar los datos desde el storage para asegurar consistencia
    setTimeout(() => {
      const freshGroup = getGroupById(groupId);
      if (freshGroup) {
        setCurrentGroup(freshGroup);
      }
    }, 100);
  };

  return {
    currentGroup,
    isGroupAdmin,
    handleGroupUpdated,
  };
};
