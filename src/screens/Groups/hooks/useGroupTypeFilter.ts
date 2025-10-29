import { useState, useMemo } from "react";
import { Group } from "../../../types/Group";

export const useGroupTypeFilter = (groups: Group[]) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Obtener todos los tipos únicos disponibles en los grupos
  // Obtener todos los estados únicos disponibles en los grupos
  const availableTypes = useMemo(() => {
    const statuses = groups.map((group) => group.status).filter(Boolean);
    return Array.from(new Set(statuses)).sort();
  }, [groups]);

  // Filtrar grupos por estado seleccionado
  const filteredGroups = useMemo(() => {
    if (!selectedType) {
      return groups;
    }
    return groups.filter((group) => group.status === selectedType);
  }, [groups, selectedType]);

  // Función para cambiar el estado seleccionado
  const handleTypeChange = (status: string | null) => {
    setSelectedType(status);
  };

  // Función para limpiar el filtro
  const clearFilter = () => {
    setSelectedType(null);
  };

  return {
    selectedType,
    availableTypes,
    filteredGroups,
    handleTypeChange,
    clearFilter,
    hasActiveFilter: selectedType !== null,
  };
};
