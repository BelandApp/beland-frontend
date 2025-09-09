// FileName: /components/EditProfileModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  ScrollView, // Añadido para permitir scroll si hay muchos campos
} from "react-native";
import { useAuthUser } from "src/hooks/useUser"; // Importa el hook useAuthUser
import { styles } from "../styles/DashboardsStyles"; // Asume que tienes estilos compartidos

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentUser: {
    full_name: string;
    email: string; // Email se muestra pero no se edita directamente aquí
    phone?: number; // Cambiado a number según el backend
    country?: string;
    city?: string;
    username?: string; // Añadido
    profile_picture_url?: string | null; // Añadido
    // Agrega aquí cualquier otro campo que el usuario pueda editar
  };
  onProfileUpdated: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const { updateAuthenticatedUser, loading, error } = useAuthUser();

  const [fullName, setFullName] = useState(currentUser.full_name);
  const [username, setUsername] = useState(currentUser.username || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    currentUser.profile_picture_url || ""
  );
  const [phone, setPhone] = useState(currentUser.phone?.toString() || ""); // Convertir a string para TextInput
  const [country, setCountry] = useState(currentUser.country || "");
  const [city, setCity] = useState(currentUser.city || "");
  const [address, setAddress] = useState(""); // Asumo que address no viene en currentUser inicialmente, o se carga aparte
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    // Resetear estados cuando el modal se abre o el currentUser cambia
    setFullName(currentUser.full_name);
    setUsername(currentUser.username || "");
    setProfilePictureUrl(currentUser.profile_picture_url || "");
    setPhone(currentUser.phone?.toString() || "");
    setCountry(currentUser.country || "");
    setCity(currentUser.city || "");
    // Si 'address' es parte de currentUser, inicialízalo aquí también
    // setAddress(currentUser.address || '');
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
  }, [currentUser, isVisible]); // Dependencia de isVisible para resetear al abrir

  const handleSave = async () => {
    setPasswordError(""); // Limpiar errores previos

    const updateData: { [key: string]: any } = {};

    // Solo incluir campos si han cambiado o si son obligatorios
    if (fullName !== currentUser.full_name) updateData.full_name = fullName;
    if (username !== currentUser.username) updateData.username = username;
    if (profilePictureUrl !== currentUser.profile_picture_url)
      updateData.profile_picture_url = profilePictureUrl;
    if (phone && parseInt(phone) !== currentUser.phone)
      updateData.phone = parseInt(phone); // Convertir a number
    if (country !== currentUser.country) updateData.country = country;
    if (city !== currentUser.city) updateData.city = city;
    // if (address !== currentUser.address) updateData.address = address; // Si address es parte de currentUser

    // Manejo de contraseña
    if (password) {
      if (password !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden.");
        return;
      }
      // Aquí podrías añadir validación de fortaleza de contraseña si no la hace el backend
      updateData.password = password;
      updateData.confirmPassword = confirmPassword; // Necesario para el DTO del backend
    }

    if (Object.keys(updateData).length === 0 && !password) {
      // No hay cambios, simplemente cerrar
      onClose();
      return;
    }

    const updatedUser = await updateAuthenticatedUser(updateData);
    if (updatedUser) {
      onProfileUpdated(updatedUser);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Editar Perfil</Text>
          <ScrollView style={modalStyles.scrollView}>
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Nombre Completo:</Text>
              <TextInput
                style={modalStyles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nombre Completo"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Nombre de Usuario:</Text>
              <TextInput
                style={modalStyles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nombre de Usuario"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>URL Foto de Perfil:</Text>
              <TextInput
                style={modalStyles.input}
                value={profilePictureUrl}
                onChangeText={setProfilePictureUrl}
                placeholder="https://example.com/photo.jpg"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Teléfono:</Text>
              <TextInput
                style={modalStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>País:</Text>
              <TextInput
                style={modalStyles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="País"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Ciudad:</Text>
              <TextInput
                style={modalStyles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Ciudad"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Dirección:</Text>
              <TextInput
                style={modalStyles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Dirección"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Nueva Contraseña:</Text>
              <TextInput
                style={modalStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Dejar en blanco para no cambiar"
                secureTextEntry
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.inputLabel}>Confirmar Contraseña:</Text>
              <TextInput
                style={modalStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nueva contraseña"
                secureTextEntry
              />
            </View>

            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, modalStyles.cancelButton]}
              onPress={onClose}
              disabled={loading}>
              <Text style={styles.textCenter}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                modalStyles.saveButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textCenter}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%", // Limitar la altura del modal
  },
  scrollView: {
    width: "100%",
    maxHeight: "80%", // Altura máxima para el contenido scrollable
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#ef4444", // Red
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#2563eb", // Blue
    flex: 1,
    marginLeft: 10,
  },
});

export default EditProfileModal;
