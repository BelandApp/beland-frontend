import React from "react";
import { View, TextInput } from "react-native";

interface Props {
  fullName: string;
  setFullName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  editing: boolean;
  styles: any;
}

const UserProfileFields: React.FC<Props> = ({
  fullName,
  setFullName,
  address,
  setAddress,
  phone,
  setPhone,
  editing,
  styles,
}) => {
  if (!editing) return null;

  return (
    <View style={{ width: "100%", marginTop: 12 }}>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        placeholder="Nombre completo"
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        placeholder="Dirección"
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
      />
    </View>
  );
};

export default UserProfileFields;
