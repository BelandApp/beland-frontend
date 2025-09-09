import React from "react";
import { Modal, View, Text, Button, StyleSheet, Platform } from "react-native";
import { useAuth } from "src/hooks/AuthContext"; 

interface AuthenticationModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
  visible,
  onClose,
  message = "Para usar esta funcionalidad, necesitas iniciar sesión.",
}) => {
  const { loginWithAuth0 } = useAuth();

    const handleLogin = () => {
        onClose(); 
        loginWithAuth0();
    }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} 
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Autenticación Requerida</Text>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Iniciar Sesión" onPress={handleLogin} />
            <Button title="Cerrar" onPress={onClose} color="#888" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", 
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});
