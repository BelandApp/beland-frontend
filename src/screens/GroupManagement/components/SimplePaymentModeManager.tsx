import React from "react";
import { View, Text } from "react-native";
import { formStyles } from "../../../styles/formStyles";
import { Group } from "../../../types/Group";

interface SimplePaymentModeManagerProps {
  group: Group;
  onGroupUpdated: (updatedGroup: Group) => void;
  isReadOnly?: boolean;
}

export const SimplePaymentModeManager: React.FC<
  SimplePaymentModeManagerProps
> = ({ group, onGroupUpdated, isReadOnly = false }) => {
  return (
    <View style={formStyles.container}>
      <Text style={formStyles.sectionTitle}>Gestión de Pagos</Text>
      <Text style={formStyles.inputLabel}>Grupo: {group.name}</Text>
      <Text style={formStyles.inputLabel}>
        Funcionalidad de gestión de modos de pago en desarrollo.
      </Text>
      <Text style={formStyles.inputLabel}>
        Estado del grupo: {group.status}
      </Text>
      {isReadOnly && (
        <Text style={formStyles.inputLabel}>
          Modo solo lectura - No tienes permisos de administrador
        </Text>
      )}
    </View>
  );
};
