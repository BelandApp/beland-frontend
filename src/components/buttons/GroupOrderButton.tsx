/**
 * GroupOrderButton - Button to trigger group order modal
 * Should be placed in checkout/cart screens
 */

import React, { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GroupOrderModal } from "../modals/GroupOrderModal";

export interface GroupOrderButtonProps {
  addressId?: string;
  deliveryDetails?: {
    delivery_cost: number;
    distance_km: number;
    duration_min: number;
  };
  onOrderCreated?: (orderId: string) => void;
  disabled?: boolean;
}

export const GroupOrderButton: React.FC<GroupOrderButtonProps> = ({
  addressId,
  deliveryDetails,
  onOrderCreated,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          disabled && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-multiple"
            size={22}
            color="#6BA43A"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.buttonText}>Compra en Grupo</Text>
          <Text style={styles.buttonSubtext}>Ahorra dividiendo costos</Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#6BA43A"
        />
      </Pressable>

      <GroupOrderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onOrderCreated={onOrderCreated}
        addressId={addressId}
        deliveryDetails={deliveryDetails}
      />
    </View>
  );
};

export default GroupOrderButton;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F0F9F0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9F0D9",
    marginVertical: 10,
    gap: 12,
    shadowColor: "#6BA43A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    backgroundColor: "#E8F4E6",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E8F4E6",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    color: "#6BA43A",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonSubtext: {
    color: "#9CAF8F",
    fontSize: 12,
    marginTop: 2,
  },
});
