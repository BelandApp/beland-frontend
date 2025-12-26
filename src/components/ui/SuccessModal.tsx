import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle } from "lucide-react-native";

interface Props {
  visible: boolean;
  message?: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<Props> = ({
  visible,
  message = "Operación realizada con éxito",
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <CheckCircle size={48} color="#4CAF50" />
          <Text style={styles.title}>¡Éxito!</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#222", marginTop: 8 },
  message: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginVertical: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});

export default SuccessModal;
