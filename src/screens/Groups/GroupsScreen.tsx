import React from "react";
import { View, ScrollView, Dimensions, TouchableOpacity, Text } from "react-native";
import { GroupsStackParamList } from "../../types/navigation";
import { WaveBottomGray } from "../../components/icons";

// Hooks
import {
  useGroupsTabs,
  useGroupsNavigation,
  useGroups,
  useGroupTypeFilter,
} from "./hooks";

// Components
import {
  GroupsHeader,
  GroupTabs,
  GroupsList,
  GroupTypeFilter,
} from "./components";

// Styles
import { buttonStyles, containerStyles } from "./styles";
import { ThemedHeader } from "src/components/shared/headers/Header";

export const GroupsScreen: React.FC<any> = (props) => {
  // Hooks personalizados
  const { selectedTab, setSelectedTab, isActiveTab } = useGroupsTabs();
  const { navigateToCreateGroup, navigateToGroupManagement } =
    useGroupsNavigation();
  const { getActiveGroups, getCompletedGroups } = useGroups();

  // Obtener los grupos
  const activeGroups = getActiveGroups();
  const completedGroups = getCompletedGroups();

  // Determinar qué grupos mostrar según la pestaña seleccionada
  const baseGroups = isActiveTab ? activeGroups : completedGroups;

  // Hook para filtrar por tipo
  const {
    selectedType,
    availableTypes,
    filteredGroups,
    handleTypeChange,
    hasActiveFilter,
  } = useGroupTypeFilter(baseGroups);

  // Los grupos a mostrar son los filtrados
  const currentGroups = filteredGroups;

  return (
    <>
      <ThemedHeader
        title="Mis Grupos"
        buttons={
          <>
            <TouchableOpacity
              style={buttonStyles.createButton}
              activeOpacity={0.8}
              onPress={navigateToCreateGroup}
            >
              <Text style={buttonStyles.createButtonText}>+ Grupo</Text>
            </TouchableOpacity>
          </>
        }
      />
      <ScrollView style={containerStyles.scrollView}>
        <View style={containerStyles.content}>
          {/* Header con título y botón crear */}

          {/* Pestañas de navegación */}
          <GroupTabs
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            activeCount={activeGroups.length}
            historyCount={completedGroups.length}
          />

          {/* Filtro por tipo de grupo */}
          {availableTypes.length > 0 && (
            <GroupTypeFilter
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              availableTypes={availableTypes}
            />
          )}

          {/* Lista de grupos */}
          <GroupsList
            groups={currentGroups}
            onGroupPress={navigateToGroupManagement}
            emptyStateType={selectedTab}
          />
        </View>
      </ScrollView>

      {/* Ola de fondo */}
      <View style={containerStyles.waveContainer}>
        <WaveBottomGray width={Dimensions.get("window").width} height={120} />
      </View>
    </>
  );
};
