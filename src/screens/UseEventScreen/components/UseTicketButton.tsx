import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "src/styles";

interface Props {
  isReadyToUse: boolean;
  onPress: () => void;
}

export const UseTicketButton: React.FC<Props> = ({ isReadyToUse, onPress }) => {
  return (
    <Pressable
      style={[styles.button, !isReadyToUse && styles.disabledButton]}
      disabled={!isReadyToUse}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>
        {isReadyToUse ? "Usar Entrada" : "Disponible 1h antes del evento"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
