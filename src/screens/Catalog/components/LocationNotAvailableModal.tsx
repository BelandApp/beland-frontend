import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";

interface LocationNotAvailableModalProps {
  visible: boolean;
  onClose: () => void;
  country: string;
}

export const LocationNotAvailableModal: React.FC<
  LocationNotAvailableModalProps
> = ({ visible, onClose, country }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="earth-off"
              size={64}
              color={colors.belandOrange}
            />
          </View>

          <Text style={styles.title}>Ubicación no disponible</Text>

          <Text style={styles.message}>
            Por el momento, solo realizamos entregas en Ecuador.
          </Text>

          <Text style={styles.submessage}>
            Detectamos que tu dirección está en {country}.
          </Text>

          <Text style={styles.info}>
            ¡Pronto estaremos disponibles en tu ubicación!
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  submessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  info: {
    fontSize: 15,
    color: colors.belandGreen,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.belandOrange,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
