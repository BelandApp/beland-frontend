import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { User, MapPin, Phone } from "lucide-react-native";

interface Props {
  fullName: string;
  setFullName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  editing: boolean;
  styles?: any;
}

const UserProfileFields: React.FC<Props> = ({
  fullName,
  setFullName,
  address,
  setAddress,
  phone,
  setPhone,
  editing,
}) => {
  if (!editing) return null;

  return (
    <View style={localStyles.container}>
      {/* Nombre Completo */}
      <View style={localStyles.inputGroup}>
        <View style={localStyles.labelRow}>
          <User size={16} color="#666" />
          <Text style={localStyles.label}>Nombre Completo</Text>
        </View>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={localStyles.input}
          placeholder="Ingresa tu nombre completo"
          placeholderTextColor="#999"
        />
      </View>

      {/* Teléfono */}
      <View style={localStyles.inputGroup}>
        <View style={localStyles.labelRow}>
          <Phone size={16} color="#666" />
          <Text style={localStyles.label}>Teléfono</Text>
        </View>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={localStyles.input}
          placeholder="Ingresa tu número de teléfono"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
      </View>

      {/* Dirección */}
      <View style={localStyles.inputGroup}>
        <View style={localStyles.labelRow}>
          <MapPin size={16} color="#666" />
          <Text style={localStyles.label}>Dirección</Text>
        </View>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={[localStyles.input, localStyles.textArea]}
          placeholder="Ingresa tu dirección"
          placeholderTextColor="#999"
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
});

export default UserProfileFields;
