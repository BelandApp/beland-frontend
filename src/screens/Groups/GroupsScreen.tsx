import React from "react";
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { WaveBottomGray } from "../../components/icons";

type Tabs = "Activos" | "Historial";

// Hooks
import { useGroupsNavigation, useGroups, useGroupTypeFilter } from "./hooks";

// Components
import { GroupsList, GroupTypeFilter } from "./components";

// Styles
import { buttonStyles, containerStyles } from "./styles";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useThemedTabs } from "src/components";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import { colors } from "src/styles";

export const GroupsScreen: React.FC<any> = (props) => {
  // Hooks
  const { navigateToCreateGroup, navigateToGroupManagement } =
    useGroupsNavigation();
  const {
    getAllGroups,
    onRefresh,
    refreshing,
    filters,
    activeGroups,
    completedGroups,
  } = useGroups();
  // Obtener los grupos
  const groups = getAllGroups();

  const { tabs, activeTab, getFilteredByActiveTab, onTabChange } =
    useThemedTabs([
      { label: "Activos", count: activeGroups.length },
      { label: "Historial", count: completedGroups.length },
    ]);
  const baseGroups = getFilteredByActiveTab(groups, filters);

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
      <ScrollView
        style={containerStyles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            style={{ padding: 0 }}
          />
        }
      >
        <View style={containerStyles.content}>
          <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
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
            emptyStateType={activeTab as Tabs}
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
