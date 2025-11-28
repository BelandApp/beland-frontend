import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Settings,
  Lock,
  Bell,
  MapPin,
  CreditCard,
  ChevronRight,
} from "lucide-react-native";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { AddressManagementModal } from "./AddressManagementModal";

interface QuickSettingsCardProps {
  onPasswordChange?: () => void;
  onNotificationSettings?: () => void;
  onAddressManagement?: () => void;
  onPaymentMethods?: () => void;
  onFullSettings?: () => void;
}

export const QuickSettingsCard: React.FC<QuickSettingsCardProps> = ({
  onPasswordChange,
  onNotificationSettings,
  onAddressManagement,
  onPaymentMethods,
  onFullSettings,
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const settingsOptions = [
    {
      icon: Lock,
      iconColor: "#FF6B35",
      iconBg: "#FFE8E0",
      label: "Cambiar Contraseña",
      onPress: () => setShowPasswordModal(true),
    },
    {
      icon: Bell,
      iconColor: "#2196F3",
      iconBg: "#E3F2FD",
      label: "Notificaciones",
      onPress: onNotificationSettings,
    },
    {
      icon: MapPin,
      iconColor: "#4CAF50",
      iconBg: "#E8F5E9",
      label: "Direcciones",
      onPress: () => setShowAddressModal(true),
    },
    {
      icon: CreditCard,
      iconColor: "#9C27B0",
      iconBg: "#F3E5F5",
      label: "Métodos de Pago",
      onPress: onPaymentMethods,
    },
  ];

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Settings size={20} color="#FF6B35" />
          <Text style={styles.title}>Configuración Rápida</Text>
        </View>

        <View style={styles.optionsList}>
          {settingsOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={option.onPress}
                disabled={!option.onPress}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: option.iconBg },
                    ]}
                  >
                    <IconComponent size={18} color={option.iconColor} />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
                <ChevronRight size={18} color="#999" />
              </TouchableOpacity>
            );
          })}
        </View>

        {onFullSettings && (
          <TouchableOpacity
            style={styles.fullSettingsButton}
            onPress={onFullSettings}
          >
            <Text style={styles.fullSettingsText}>
              Ver todas las configuraciones
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <AddressManagementModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  optionsList: {
    gap: 2,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  fullSettingsButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  fullSettingsText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
});
