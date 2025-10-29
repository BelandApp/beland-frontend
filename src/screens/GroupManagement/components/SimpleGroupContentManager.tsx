import React from "react";
import { View, Text } from "react-native";
import { formStyles } from "../../../styles/formStyles";
import { Group } from "../../../types/Group";

interface SimpleGroupContentManagerProps {
  group: Group;
  onGroupUpdated: (updatedGroup: Group) => void;
  isReadOnly?: boolean;
  navigation?: any;
}

export const SimpleGroupContentManager: React.FC<
  SimpleGroupContentManagerProps
> = ({ group, onGroupUpdated, isReadOnly = false, navigation }) => {
  return (
    <View style={formStyles.container}>
      <Text style={formStyles.sectionTitle}>Gestión de Contenido</Text>
      <Text style={formStyles.inputLabel}>Grupo: {group.name}</Text>
      <Text style={formStyles.inputLabel}>
        Funcionalidad de gestión de productos y participantes en desarrollo.
      </Text>
      <Text style={formStyles.inputLabel}>
        Estado del grupo: {group.status}
      </Text>
      {group.location && (
        <Text style={formStyles.inputLabel}>Ubicación: {group.location}</Text>
      )}
    </View>
  );
};
